'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import type {
  TaskFilter,
  TaskStatus,
  TaskContext,
  TaskEnergyLevel,
  TaskDuration
} from '@/types/database'
import {
  X,
  Filter,
  AlertTriangle,
  Calendar,
  Folder,
  RefreshCw,
  Inbox,
  Clock,
  FolderOpen,
  CheckCircle2,
  Phone,
  Monitor,
  Car,
  Home,
  Building,
  Globe,
  Zap,
  Battery,
  ZapOff
} from 'lucide-react'

interface TaskFiltersProps {
  filters: TaskFilter
  onFiltersChange: (filters: Partial<TaskFilter>) => void
  onClose: () => void
  className?: string
}

const statusOptions = [
  { value: 'captured', label: 'Captured', icon: Inbox, color: 'text-blue-600' },
  { value: 'next_action', label: 'Next Actions', icon: AlertTriangle, color: 'text-orange-600' },
  { value: 'project', label: 'Projects', icon: FolderOpen, color: 'text-purple-600' },
  { value: 'waiting_for', label: 'Waiting For', icon: Clock, color: 'text-yellow-600' },
  { value: 'someday', label: 'Someday/Maybe', icon: CheckCircle2, color: 'text-gray-600' },
  { value: 'completed', label: 'Completed', icon: CheckCircle2, color: 'text-green-600' },
] as const

const contextOptions = [
  { value: 'calls', label: 'Calls', icon: Phone },
  { value: 'computer', label: 'Computer', icon: Monitor },
  { value: 'errands', label: 'Errands', icon: Car },
  { value: 'home', label: 'Home', icon: Home },
  { value: 'office', label: 'Office', icon: Building },
  { value: 'anywhere', label: 'Anywhere', icon: Globe },
] as const

const energyOptions = [
  { value: 'high', label: 'High Energy', icon: Zap, color: 'text-green-600' },
  { value: 'medium', label: 'Medium Energy', icon: Battery, color: 'text-yellow-600' },
  { value: 'low', label: 'Low Energy', icon: ZapOff, color: 'text-red-600' },
] as const

const durationOptions = [
  { value: '5min', label: '5 minutes' },
  { value: '15min', label: '15 minutes' },
  { value: '30min', label: '30 minutes' },
  { value: '1hour', label: '1 hour' },
  { value: '2hour+', label: '2+ hours' },
] as const

const priorityOptions = [
  { value: 1, label: 'Highest (1)', color: 'bg-red-100 text-red-800' },
  { value: 2, label: 'High (2)', color: 'bg-orange-100 text-orange-800' },
  { value: 3, label: 'Medium (3)', color: 'bg-yellow-100 text-yellow-800' },
  { value: 4, label: 'Low (4)', color: 'bg-blue-100 text-blue-800' },
  { value: 5, label: 'Lowest (5)', color: 'bg-gray-100 text-gray-800' },
] as const

export function TaskFilters({ filters, onFiltersChange, onClose, className }: TaskFiltersProps) {
  const [localFilters, setLocalFilters] = useState<TaskFilter>(filters)

  const updateLocalFilter = (key: keyof TaskFilter, value: TaskFilter[keyof TaskFilter]) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const toggleArrayValue = <T,>(key: keyof TaskFilter, value: T) => {
    const currentArray = (localFilters[key] as T[]) || []
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value]
    updateLocalFilter(key, newArray.length > 0 ? newArray as any : undefined)
  }

  const clearAllFilters = () => {
    const emptyFilters: TaskFilter = {}
    setLocalFilters(emptyFilters)
    onFiltersChange(emptyFilters)
  }

  const hasActiveFilters = Object.values(localFilters).some(value =>
    Array.isArray(value) ? value.length > 0 : value !== undefined
  )

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Task Filters
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Status</Label>
          <div className="grid grid-cols-2 gap-2">
            {statusOptions.map((option) => {
              const isSelected = localFilters.status?.includes(option.value as TaskStatus)
              const Icon = option.icon
              return (
                <Button
                  key={option.value}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleArrayValue('status', option.value as TaskStatus)}
                  className={`justify-start ${isSelected ? '' : 'hover:bg-gray-50'}`}
                >
                  <Icon className={`h-4 w-4 mr-2 ${isSelected ? 'text-white' : option.color}`} />
                  {option.label}
                </Button>
              )
            })}
          </div>
        </div>

        {/* Context Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Context</Label>
          <div className="grid grid-cols-2 gap-2">
            {contextOptions.map((option) => {
              const isSelected = localFilters.context?.includes(option.value as TaskContext)
              const Icon = option.icon
              return (
                <Button
                  key={option.value}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleArrayValue('context', option.value as TaskContext)}
                  className="justify-start"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {option.label}
                </Button>
              )
            })}
          </div>
        </div>

        {/* Energy Level Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Energy Level</Label>
          <div className="space-y-2">
            {energyOptions.map((option) => {
              const isSelected = localFilters.energy_level?.includes(option.value as TaskEnergyLevel)
              const Icon = option.icon
              return (
                <Button
                  key={option.value}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleArrayValue('energy_level', option.value as TaskEnergyLevel)}
                  className="justify-start w-full"
                >
                  <Icon className={`h-4 w-4 mr-2 ${isSelected ? 'text-white' : option.color}`} />
                  {option.label}
                </Button>
              )
            })}
          </div>
        </div>

        {/* Duration Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Estimated Duration</Label>
          <div className="space-y-2">
            {durationOptions.map((option) => {
              const isSelected = localFilters.estimated_duration?.includes(option.value as TaskDuration)
              return (
                <Button
                  key={option.value}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleArrayValue('estimated_duration', option.value as TaskDuration)}
                  className="justify-start w-full"
                >
                  {option.label}
                </Button>
              )
            })}
          </div>
        </div>

        {/* Priority Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Priority</Label>
          <div className="space-y-2">
            {priorityOptions.map((option) => {
              const isSelected = localFilters.priority?.includes(option.value)
              return (
                <Button
                  key={option.value}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleArrayValue('priority', option.value)}
                  className="justify-start w-full"
                >
                  <div className={`w-3 h-3 rounded-full mr-2 ${isSelected ? 'bg-white' : option.color.replace('text-', 'bg-').replace('800', '500')}`} />
                  {option.label}
                </Button>
              )
            })}
          </div>
        </div>

        {/* Date Filters */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Date Filters</Label>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-orange-600" />
                <span className="text-sm">Due Today</span>
              </div>
              <Switch
                checked={localFilters.due_today || false}
                onCheckedChange={(checked) => updateLocalFilter('due_today', checked || undefined)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm">Overdue</span>
              </div>
              <Switch
                checked={localFilters.overdue || false}
                onCheckedChange={(checked) => updateLocalFilter('overdue', checked || undefined)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Folder className="h-4 w-4 text-purple-600" />
                <span className="text-sm">Has Project</span>
              </div>
              <Switch
                checked={localFilters.has_project !== undefined ? localFilters.has_project : false}
                onCheckedChange={(checked) => updateLocalFilter('has_project', checked || undefined)}
              />
            </div>
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="space-y-3 pt-4 border-t">
            <Label className="text-sm font-medium">Active Filters</Label>
            <div className="flex flex-wrap gap-1">
              {localFilters.status?.map(status => {
                const option = statusOptions.find(opt => opt.value === status)
                return (
                  <Badge key={status} variant="secondary" className="text-xs">
                    {option?.label}
                  </Badge>
                )
              })}
              {localFilters.context?.map(context => {
                const option = contextOptions.find(opt => opt.value === context)
                return (
                  <Badge key={context} variant="secondary" className="text-xs">
                    {option?.label}
                  </Badge>
                )
              })}
              {localFilters.energy_level?.map(energy => {
                const option = energyOptions.find(opt => opt.value === energy)
                return (
                  <Badge key={energy} variant="secondary" className="text-xs">
                    {option?.label}
                  </Badge>
                )
              })}
              {localFilters.estimated_duration?.map(duration => {
                const option = durationOptions.find(opt => opt.value === duration)
                return (
                  <Badge key={duration} variant="secondary" className="text-xs">
                    {option?.label}
                  </Badge>
                )
              })}
              {localFilters.priority?.map(priority => {
                const option = priorityOptions.find(opt => opt.value === priority)
                return (
                  <Badge key={priority} variant="secondary" className="text-xs">
                    P{priority}
                  </Badge>
                )
              })}
              {localFilters.due_today && (
                <Badge variant="secondary" className="text-xs">Due Today</Badge>
              )}
              {localFilters.overdue && (
                <Badge variant="secondary" className="text-xs">Overdue</Badge>
              )}
              {localFilters.has_project && (
                <Badge variant="secondary" className="text-xs">Has Project</Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}