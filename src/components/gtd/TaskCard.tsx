'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Clock,
  User,
  Calendar,
  MoreHorizontal,
  CheckCircle2,
  Circle,
  Edit3,
  Trash2,
  ExternalLink,
  Flag,
  Zap,
  Phone,
  Monitor,
  Car,
  Home,
  Building,
  Globe
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { Task, TaskStatus, TaskContext, TaskEnergyLevel } from '@/types/database'

interface TaskCardProps {
  task: Task
  onEdit?: (task: Task) => void
  onDelete?: (taskId: string) => void
  onComplete?: (taskId: string, completed: boolean) => void
  onStatusChange?: (taskId: string, status: TaskStatus) => void
  onDragStart?: (task: Task) => void
  showProject?: boolean
  compact?: boolean
  className?: string
}

const contextIcons: Record<TaskContext, React.ElementType> = {
  calls: Phone,
  computer: Monitor,
  errands: Car,
  home: Home,
  office: Building,
  anywhere: Globe
}

const energyColors: Record<TaskEnergyLevel, string> = {
  high: 'text-red-500',
  medium: 'text-yellow-500',
  low: 'text-green-500'
}

const priorityColors = {
  1: 'border-l-red-500 bg-red-50',
  2: 'border-l-orange-500 bg-orange-50',
  3: 'border-l-yellow-500 bg-yellow-50',
  4: 'border-l-blue-500 bg-blue-50',
  5: 'border-l-gray-500 bg-gray-50'
}

export function TaskCard({
  task,
  onEdit,
  onDelete,
  onComplete,
  onStatusChange,
  onDragStart,
  showProject = true,
  compact = false,
  className
}: TaskCardProps) {
  const [isCompleting, setIsCompleting] = useState(false)

  const isCompleted = task.status === 'completed' || task.completed_at
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !isCompleted
  const isDueToday = task.due_date &&
    new Date(task.due_date).toDateString() === new Date().toDateString()

  const handleComplete = async () => {
    if (!onComplete) return

    setIsCompleting(true)
    try {
      await onComplete(task.id, !isCompleted)
    } finally {
      setIsCompleting(false)
    }
  }

  const handleStatusChange = (newStatus: TaskStatus) => {
    if (onStatusChange) {
      onStatusChange(task.id, newStatus)
    }
  }

  const ContextIcon = task.context ? contextIcons[task.context] : null

  return (
    <Card
      className={cn(
        'group transition-all duration-200 hover:shadow-md cursor-pointer border-l-4',
        task.priority && priorityColors[task.priority as keyof typeof priorityColors],
        isCompleted && 'opacity-60',
        isOverdue && 'ring-2 ring-red-200',
        className
      )}
      draggable={!!onDragStart}
      onDragStart={() => onDragStart?.(task)}
    >
      <CardContent className={cn('p-4', compact && 'p-3')}>
        <div className="flex items-start gap-3">
          {/* Completion checkbox */}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 mt-0.5 hover:bg-transparent"
            onClick={handleComplete}
            disabled={isCompleting}
          >
            {isCompleting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600" />
            ) : isCompleted ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <Circle className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            )}
          </Button>

          {/* Task content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className={cn(
                  'font-medium text-gray-900 mb-1',
                  isCompleted && 'line-through text-gray-500',
                  compact ? 'text-sm' : 'text-base'
                )}>
                  {task.title}
                </h3>

                {task.description && !compact && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {task.description}
                  </p>
                )}

                {/* Tags and metadata */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {/* Context */}
                  {ContextIcon && (
                    <div className="flex items-center gap-1 text-gray-500">
                      <ContextIcon className="h-3 w-3" />
                      <span>@{task.context}</span>
                    </div>
                  )}

                  {/* Energy level */}
                  {task.energy_level && (
                    <div className={cn('flex items-center gap-1', energyColors[task.energy_level])}>
                      <Zap className="h-3 w-3" />
                      <span>{task.energy_level}</span>
                    </div>
                  )}

                  {/* Duration */}
                  {task.estimated_duration && (
                    <div className="flex items-center gap-1 text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{task.estimated_duration}</span>
                    </div>
                  )}

                  {/* Due date */}
                  {task.due_date && (
                    <div className={cn(
                      'flex items-center gap-1',
                      isOverdue ? 'text-red-500' : isDueToday ? 'text-orange-500' : 'text-gray-500'
                    )}>
                      <Calendar className="h-3 w-3" />
                      <span>
                        {isDueToday ? 'Today' :
                         isOverdue ? 'Overdue' :
                         new Date(task.due_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {/* Waiting for */}
                  {task.waiting_for && (
                    <div className="flex items-center gap-1 text-blue-600">
                      <User className="h-3 w-3" />
                      <span>Waiting: {task.waiting_for}</span>
                    </div>
                  )}

                  {/* Priority flag */}
                  {task.priority && task.priority <= 2 && (
                    <div className="flex items-center gap-1 text-red-500">
                      <Flag className="h-3 w-3" />
                      <span>High</span>
                    </div>
                  )}

                  {/* Custom tags */}
                  {task.tags?.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Actions menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(task)}>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Task
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem onClick={handleComplete}>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
                  </DropdownMenuItem>

                  {onStatusChange && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleStatusChange('next_action')}>
                        Move to Next Actions
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange('waiting_for')}>
                        Move to Waiting For
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange('someday')}>
                        Move to Someday/Maybe
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange('project')}>
                        Convert to Project
                      </DropdownMenuItem>
                    </>
                  )}

                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(task.id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}