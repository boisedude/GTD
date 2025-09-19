'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  FolderOpen,
  MoreHorizontal,
  Edit3,
  Trash2,
  CheckCircle2,
  Circle,
  Plus,
  Calendar,
  Users,
  Target
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Project, Task } from '@/types/database'

interface ProjectCardProps {
  project: Project
  tasks?: Task[]
  onEdit?: (project: Project) => void
  onDelete?: (projectId: string) => void
  onComplete?: (projectId: string, completed: boolean) => void
  onAddTask?: (projectId: string) => void
  onViewDetails?: (project: Project) => void
  compact?: boolean
  className?: string
}

export function ProjectCard({
  project,
  tasks = [],
  onEdit,
  onDelete,
  onComplete,
  onAddTask,
  onViewDetails,
  compact = false,
  className
}: ProjectCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const isCompleted = project.status === 'complete'
  const completedTasks = tasks.filter(task => task.status === 'completed' || task.completed_at)
  const activeTasks = tasks.filter(task => task.status !== 'completed' && !task.completed_at)
  const nextActions = activeTasks.filter(task => task.status === 'next_action')
  const waitingFor = activeTasks.filter(task => task.status === 'waiting_for')

  const progressPercentage = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0

  const handleComplete = async () => {
    if (!onComplete) return

    setIsUpdating(true)
    try {
      await onComplete(project.id, !isCompleted)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(project)
    }
  }

  return (
    <Card
      className={cn(
        'group transition-all duration-200 hover:shadow-md cursor-pointer',
        isCompleted && 'opacity-75 bg-gray-50',
        className
      )}
      onClick={handleViewDetails}
    >
      <CardHeader className={cn('pb-3', compact && 'pb-2')}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-transparent"
              onClick={(e) => {
                e.stopPropagation()
                handleComplete()
              }}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600" />
              ) : isCompleted ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <Circle className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </Button>

            <div className="flex-1 min-w-0">
              <CardTitle className={cn(
                'flex items-center gap-2 text-lg',
                isCompleted && 'line-through text-gray-500',
                compact && 'text-base'
              )}>
                <FolderOpen className="h-5 w-5 text-purple-600 flex-shrink-0" />
                <span className="truncate">{project.name}</span>
              </CardTitle>

              {!compact && (
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    <span>{tasks.length} tasks</span>
                  </div>

                  {nextActions.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Circle className="h-4 w-4 text-orange-500" />
                      <span>{nextActions.length} next actions</span>
                    </div>
                  )}

                  {waitingFor.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-yellow-500" />
                      <span>{waitingFor.length} waiting</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <Badge
              variant={isCompleted ? 'secondary' : 'default'}
              className={cn(
                isCompleted ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
              )}
            >
              {isCompleted ? 'Complete' : 'Active'}
            </Badge>

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
                  <DropdownMenuItem onClick={() => onEdit(project)}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Project
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem onClick={handleComplete}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {isCompleted ? 'Reactivate' : 'Mark Complete'}
                </DropdownMenuItem>

                {onAddTask && !isCompleted && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onAddTask(project.id)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Task
                    </DropdownMenuItem>
                  </>
                )}

                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(project.id)}
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
      </CardHeader>

      {!compact && (
        <CardContent className="pt-0">
          {/* Progress bar */}
          {tasks.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium">{progressPercentage}% complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={cn(
                    'h-2 rounded-full transition-all duration-300',
                    isCompleted ? 'bg-green-500' : 'bg-purple-500'
                  )}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{completedTasks.length} completed</span>
                <span>{activeTasks.length} remaining</span>
              </div>
            </div>
          )}

          {/* Quick actions */}
          {!isCompleted && tasks.length === 0 && (
            <div className="text-center py-4 border-2 border-dashed border-gray-200 rounded-lg">
              <p className="text-sm text-gray-500 mb-2">No tasks yet</p>
              {onAddTask && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onAddTask(project.id)
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Task
                </Button>
              )}
            </div>
          )}

          {/* Recent tasks preview */}
          {tasks.length > 0 && !compact && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Recent Tasks</h4>
              {activeTasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm"
                >
                  <Circle className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="truncate flex-1">{task.title}</span>
                  <Badge variant="outline" className="text-xs">
                    {task.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}

              {activeTasks.length > 3 && (
                <p className="text-xs text-gray-500 text-center">
                  +{activeTasks.length - 3} more tasks
                </p>
              )}
            </div>
          )}

          {/* Last updated */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Updated {new Date(project.updated_at).toLocaleDateString()}</span>
              </div>
              <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}