'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Task, TaskAction } from '@/types/database'
import {
  CheckCircle2,
  Clock,
  Users,
  ArrowRight,
  Phone,
  Monitor,
  Car,
  Home,
  Building,
  Globe,
  Zap,
  Battery,
  ZapOff,
  Timer,
  Calendar,
  AlertTriangle
} from 'lucide-react'

interface SwipeableTaskCardProps {
  task: Task
  onSwipeAction: (action: TaskAction) => Promise<void>
  onTap: () => void
  className?: string
}

const contextIcons = {
  calls: Phone,
  computer: Monitor,
  errands: Car,
  home: Home,
  office: Building,
  anywhere: Globe,
}

const energyIcons = {
  high: Zap,
  medium: Battery,
  low: ZapOff,
}

const statusColors = {
  captured: 'bg-blue-100 text-blue-800',
  next_action: 'bg-orange-100 text-orange-800',
  project: 'bg-purple-100 text-purple-800',
  waiting_for: 'bg-yellow-100 text-yellow-800',
  someday: 'bg-gray-100 text-gray-800',
  completed: 'bg-green-100 text-green-800',
}

const swipeActions = {
  complete: {
    icon: CheckCircle2,
    color: 'bg-green-500',
    text: 'Complete',
    threshold: 80
  },
  defer: {
    icon: Clock,
    color: 'bg-yellow-500',
    text: 'Defer',
    threshold: 80
  },
  delegate: {
    icon: Users,
    color: 'bg-blue-500',
    text: 'Delegate',
    threshold: 120
  }
}

export function SwipeableTaskCard({
  task,
  onSwipeAction,
  onTap,
  className
}: SwipeableTaskCardProps) {
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [activeAction, setActiveAction] = useState<keyof typeof swipeActions | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const startX = useRef(0)
  const currentX = useRef(0)

  const ContextIcon = task.context ? contextIcons[task.context] : null
  const EnergyIcon = task.energy_level ? energyIcons[task.energy_level] : null

  const isOverdue = task.due_date && new Date(task.due_date) < new Date()
  const isDueToday = task.due_date &&
    new Date(task.due_date).toDateString() === new Date().toDateString()

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return

      currentX.current = e.clientX
      const diff = currentX.current - startX.current
      const newOffset = Math.max(-150, Math.min(150, diff))
      setSwipeOffset(newOffset)

      // Determine active action based on swipe distance
      if (Math.abs(newOffset) < swipeActions.complete.threshold) {
        setActiveAction(null)
      } else if (newOffset > 0) {
        if (newOffset >= swipeActions.delegate.threshold) {
          setActiveAction('delegate')
        } else {
          setActiveAction('complete')
        }
      } else {
        setActiveAction('defer')
      }
    }

    const handleMouseUp = async () => {
      if (!isDragging) return

      setIsDragging(false)

      if (activeAction && Math.abs(swipeOffset) >= swipeActions[activeAction].threshold) {
        await onSwipeAction({ type: activeAction })
      }

      setSwipeOffset(0)
      setActiveAction(null)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return

      currentX.current = e.touches[0].clientX
      const diff = currentX.current - startX.current
      const newOffset = Math.max(-150, Math.min(150, diff))
      setSwipeOffset(newOffset)

      // Determine active action based on swipe distance
      if (Math.abs(newOffset) < swipeActions.complete.threshold) {
        setActiveAction(null)
      } else if (newOffset > 0) {
        if (newOffset >= swipeActions.delegate.threshold) {
          setActiveAction('delegate')
        } else {
          setActiveAction('complete')
        }
      } else {
        setActiveAction('defer')
      }
    }

    const handleTouchEnd = async () => {
      if (!isDragging) return

      setIsDragging(false)

      if (activeAction && Math.abs(swipeOffset) >= swipeActions[activeAction].threshold) {
        await onSwipeAction({ type: activeAction })
      }

      setSwipeOffset(0)
      setActiveAction(null)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleTouchMove)
      document.addEventListener('touchend', handleTouchEnd)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isDragging, swipeOffset, activeAction, onSwipeAction])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return // Only left click
    startX.current = e.clientX
    currentX.current = e.clientX
    setIsDragging(true)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    currentX.current = e.touches[0].clientX
    setIsDragging(true)
  }

  const handleClick = () => {
    if (Math.abs(swipeOffset) < 5 && !isDragging) {
      onTap()
    }
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Action backgrounds */}
      <div className="absolute inset-0 flex">
        {/* Left action (defer) */}
        <div className={`${swipeActions.defer.color} flex items-center justify-start pl-4 transition-opacity duration-200 ${swipeOffset < -swipeActions.defer.threshold ? 'opacity-100' : 'opacity-60'}`}>
          <swipeActions.defer.icon className="h-6 w-6 text-white mr-2" />
          <span className="text-white font-medium">{swipeActions.defer.text}</span>
        </div>

        {/* Right actions */}
        <div className="flex ml-auto">
          {/* Complete action */}
          <div className={`${swipeActions.complete.color} flex items-center justify-center px-4 transition-opacity duration-200 ${swipeOffset >= swipeActions.complete.threshold && swipeOffset < swipeActions.delegate.threshold ? 'opacity-100' : 'opacity-60'}`}>
            <swipeActions.complete.icon className="h-6 w-6 text-white mr-2" />
            <span className="text-white font-medium">{swipeActions.complete.text}</span>
          </div>

          {/* Delegate action */}
          <div className={`${swipeActions.delegate.color} flex items-center justify-center px-4 transition-opacity duration-200 ${swipeOffset >= swipeActions.delegate.threshold ? 'opacity-100' : 'opacity-60'}`}>
            <swipeActions.delegate.icon className="h-6 w-6 text-white mr-2" />
            <span className="text-white font-medium">{swipeActions.delegate.text}</span>
          </div>
        </div>
      </div>

      {/* Task card */}
      <Card
        ref={cardRef}
        className={`relative transition-transform duration-200 ease-out cursor-pointer ${isDragging ? 'shadow-lg' : 'hover:shadow-md'}`}
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out'
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={handleClick}
      >
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <Badge className={statusColors[task.status]} variant="secondary">
                {task.status.replace('_', ' ')}
              </Badge>

              {(isOverdue || isDueToday) && (
                <div className="flex items-center gap-1">
                  <Calendar className={`h-4 w-4 ${isOverdue ? 'text-red-500' : 'text-orange-500'}`} />
                  <span className={`text-xs ${isOverdue ? 'text-red-600' : 'text-orange-600'}`}>
                    {isOverdue ? 'Overdue' : 'Due today'}
                  </span>
                </div>
              )}
            </div>

            {/* Task content */}
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900 line-clamp-2">
                {task.title}
              </h3>

              {task.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>

            {/* Metadata */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-gray-500">
                {ContextIcon && (
                  <div className="flex items-center gap-1">
                    <ContextIcon className="h-3 w-3" />
                    <span className="capitalize">{task.context}</span>
                  </div>
                )}

                {EnergyIcon && (
                  <div className="flex items-center gap-1">
                    <EnergyIcon className="h-3 w-3" />
                    <span className="capitalize">{task.energy_level}</span>
                  </div>
                )}

                {task.estimated_duration && (
                  <div className="flex items-center gap-1">
                    <Timer className="h-3 w-3" />
                    <span>{task.estimated_duration}</span>
                  </div>
                )}

                {task.priority && task.priority <= 2 && (
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-orange-500" />
                    <span>P{task.priority}</span>
                  </div>
                )}
              </div>

              <ArrowRight className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Swipe hint overlay for first-time users */}
      {!isDragging && swipeOffset === 0 && (
        <div className="absolute bottom-1 right-2 text-xs text-gray-400 pointer-events-none">
          Swipe for actions
        </div>
      )}
    </div>
  )
}