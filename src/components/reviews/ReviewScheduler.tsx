'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { useReviews } from '@/hooks/useReviews'
import {
  Clock,
  Calendar,
  Bell,
  Settings,
  Target,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Moon,
  Sun,
  Coffee,
  Briefcase
} from 'lucide-react'
import type { ReviewType } from '@/types/database'

interface ReviewSchedule {
  enabled: boolean
  type: ReviewType
  time: string
  days: number[] // 0 = Sunday, 1 = Monday, etc.
  reminders: {
    enabled: boolean
    beforeMinutes: number
  }
  autoStart: boolean
}

interface ReviewSchedulerProps {
  onScheduleChange?: (schedules: ReviewSchedule[]) => void
  compact?: boolean
}

const DEFAULT_SCHEDULES: ReviewSchedule[] = [
  {
    enabled: true,
    type: 'daily',
    time: '09:00',
    days: [1, 2, 3, 4, 5], // Monday through Friday
    reminders: {
      enabled: true,
      beforeMinutes: 15
    },
    autoStart: false
  },
  {
    enabled: true,
    type: 'weekly',
    time: '10:00',
    days: [5], // Friday
    reminders: {
      enabled: true,
      beforeMinutes: 30
    },
    autoStart: false
  }
]

export function ReviewScheduler({ onScheduleChange, compact = false }: ReviewSchedulerProps) {
  const [schedules, setSchedules] = useState<ReviewSchedule[]>(DEFAULT_SCHEDULES)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const { getReviewStreak, getCompletionRate } = useReviews()

  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted')
    }
  }, [])

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      setNotificationsEnabled(permission === 'granted')
    }
  }

  const updateSchedule = (index: number, updates: Partial<ReviewSchedule>) => {
    const newSchedules = [...schedules]
    newSchedules[index] = { ...newSchedules[index], ...updates }
    setSchedules(newSchedules)
    onScheduleChange?.(newSchedules)
  }

  const toggleDay = (scheduleIndex: number, day: number) => {
    const schedule = schedules[scheduleIndex]
    const newDays = schedule.days.includes(day)
      ? schedule.days.filter(d => d !== day)
      : [...schedule.days, day].sort()

    updateSchedule(scheduleIndex, { days: newDays })
  }

  if (compact) {
    return <CompactScheduler schedules={schedules} notificationsEnabled={notificationsEnabled} />
  }

  return (
    <div className="space-y-6">
      {/* Notification settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>
            Configure reminders to help you maintain consistent review habits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications">Enable Notifications</Label>
                <p className="text-sm text-gray-600">Get reminded when it's time for your reviews</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="notifications"
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                  disabled={'Notification' in window && Notification.permission === 'denied'}
                />
                {!notificationsEnabled && 'Notification' in window && (
                  <Button size="sm" variant="outline" onClick={requestNotificationPermission}>
                    Enable
                  </Button>
                )}
              </div>
            </div>

            {!('Notification' in window) && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700">
                  Notifications are not supported in this browser.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Schedule configuration */}
      {schedules.map((schedule, index) => (
        <ScheduleCard
          key={`${schedule.type}-${index}`}
          schedule={schedule}
          onUpdate={(updates) => updateSchedule(index, updates)}
          onToggleDay={(day) => toggleDay(index, day)}
          notificationsEnabled={notificationsEnabled}
        />
      ))}

      {/* Current status */}
      <ReviewStatusCard />
    </div>
  )
}

function ScheduleCard({
  schedule,
  onUpdate,
  onToggleDay,
  notificationsEnabled
}: {
  schedule: ReviewSchedule
  onUpdate: (updates: Partial<ReviewSchedule>) => void
  onToggleDay: (day: number) => void
  notificationsEnabled: boolean
}) {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const getScheduleIcon = () => {
    if (schedule.type === 'daily') {
      const hour = parseInt(schedule.time.split(':')[0])
      if (hour < 6) return Moon
      if (hour < 12) return Sun
      if (hour < 17) return Briefcase
      return Coffee
    }
    return Calendar
  }

  const Icon = getScheduleIcon()
  const isDaily = schedule.type === 'daily'

  return (
    <Card className={schedule.enabled ? 'border-green-200' : 'border-gray-200'}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              schedule.enabled ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              <Icon className={`h-5 w-5 ${
                schedule.enabled ? 'text-green-600' : 'text-gray-400'
              }`} />
            </div>
            <div>
              <CardTitle className="capitalize">{schedule.type} Review</CardTitle>
              <CardDescription>
                {isDaily ? 'Quick daily check-in' : 'Comprehensive weekly review'}
              </CardDescription>
            </div>
          </div>
          <Switch
            checked={schedule.enabled}
            onCheckedChange={(enabled) => onUpdate({ enabled })}
          />
        </div>
      </CardHeader>

      {schedule.enabled && (
        <CardContent className="space-y-4">
          {/* Time setting */}
          <div>
            <Label htmlFor={`time-${schedule.type}`}>Preferred Time</Label>
            <Input
              id={`time-${schedule.type}`}
              type="time"
              value={schedule.time}
              onChange={(e) => onUpdate({ time: e.target.value })}
              className="mt-1 w-32"
            />
          </div>

          {/* Days selection */}
          <div>
            <Label>Days</Label>
            <div className="flex gap-2 mt-2">
              {dayNames.map((day, index) => (
                <Button
                  key={day}
                  variant={schedule.days.includes(index) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onToggleDay(index)}
                  className="w-12 h-10 p-0"
                >
                  {day}
                </Button>
              ))}
            </div>
          </div>

          {/* Reminder settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor={`reminder-${schedule.type}`}>Reminder</Label>
              <Switch
                id={`reminder-${schedule.type}`}
                checked={schedule.reminders.enabled}
                onCheckedChange={(enabled) =>
                  onUpdate({ reminders: { ...schedule.reminders, enabled } })
                }
                disabled={!notificationsEnabled}
              />
            </div>

            {schedule.reminders.enabled && (
              <div className="ml-4">
                <Label>Remind me</Label>
                <Select
                  value={schedule.reminders.beforeMinutes.toString()}
                  onValueChange={(value) =>
                    onUpdate({
                      reminders: {
                        ...schedule.reminders,
                        beforeMinutes: parseInt(value)
                      }
                    })
                  }
                >
                  <SelectTrigger className="w-48 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 minutes before</SelectItem>
                    <SelectItem value="15">15 minutes before</SelectItem>
                    <SelectItem value="30">30 minutes before</SelectItem>
                    <SelectItem value="60">1 hour before</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Auto-start option */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor={`autostart-${schedule.type}`}>Auto-start Review</Label>
              <p className="text-sm text-gray-600">
                Automatically open the review workflow at scheduled time
              </p>
            </div>
            <Switch
              id={`autostart-${schedule.type}`}
              checked={schedule.autoStart}
              onCheckedChange={(autoStart) => onUpdate({ autoStart })}
            />
          </div>
        </CardContent>
      )}
    </Card>
  )
}

function ReviewStatusCard() {
  const { getReviewStreak, getCompletionRate, recentReviews } = useReviews()

  const streak = getReviewStreak()
  const weeklyRate = getCompletionRate(7)
  const lastReview = recentReviews[0]

  const getNextScheduledTime = () => {
    // This would calculate the next scheduled review time based on current schedules
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(9, 0, 0, 0)

    return tomorrow.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Review Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{streak}</div>
            <div className="text-sm text-gray-600">Day Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{weeklyRate}%</div>
            <div className="text-sm text-gray-600">This Week</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {lastReview ? new Date(lastReview.completed_at).toLocaleDateString() : 'Never'}
            </div>
            <div className="text-sm text-gray-600">Last Review</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-900">Next Scheduled</div>
            <div className="text-xs text-gray-600">{getNextScheduledTime()}</div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Weekly Goal Progress</span>
            <span>{Math.round(weeklyRate)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(weeklyRate, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CompactScheduler({
  schedules,
  notificationsEnabled
}: {
  schedules: ReviewSchedule[]
  notificationsEnabled: boolean
}) {
  const activeSchedules = schedules.filter(s => s.enabled)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Review Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activeSchedules.map((schedule) => (
            <div key={schedule.type} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={schedule.type === 'daily' ? 'default' : 'secondary'}>
                  {schedule.type}
                </Badge>
                <span className="text-sm">{schedule.time}</span>
              </div>
              <div className="flex items-center gap-1">
                {schedule.reminders.enabled && notificationsEnabled && (
                  <Bell className="h-3 w-3 text-gray-400" />
                )}
                <CheckCircle2 className="h-3 w-3 text-green-500" />
              </div>
            </div>
          ))}

          {activeSchedules.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-2">
              No schedules configured
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Hook for managing review notifications
export function useReviewNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const scheduleNotification = (title: string, message: string, delay: number) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      setTimeout(() => {
        const notification = new Notification(title, {
          body: message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'gtd-review',
          requireInteraction: true
        })

        notification.onclick = () => {
          window.focus()
          notification.close()
        }

        setNotifications(prev => [...prev, notification])
      }, delay)
    }
  }

  const clearNotifications = () => {
    notifications.forEach(n => n.close())
    setNotifications([])
  }

  return {
    scheduleNotification,
    clearNotifications,
    canNotify: 'Notification' in window && Notification.permission === 'granted'
  }
}