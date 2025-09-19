'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import type {
  Task,
  TaskFilter,
  EngagementContext,
  TaskSuggestion,
  TaskAction,
  TaskStatus,
  TaskContext,
  TaskEnergyLevel,
  TaskDuration
} from '@/types/database'
import { useTasks } from './useTasks'

interface UseEngagementOptions {
  autoRefresh?: boolean
  maxSuggestions?: number
}

interface UseEngagementReturn {
  suggestions: TaskSuggestion[]
  filteredTasks: Task[]
  activeFilters: TaskFilter
  context: EngagementContext
  loading: boolean
  updateContext: (newContext: Partial<EngagementContext>) => void
  updateFilters: (newFilters: Partial<TaskFilter>) => void
  executeAction: (taskId: string, action: TaskAction) => Promise<void>
  refreshSuggestions: () => void
}

// Smart scoring algorithm for task suggestions
function calculateTaskScore(task: Task, context: EngagementContext): { score: number; reasons: string[] } {
  let score = 0
  const reasons: string[] = []

  // Base score for actionable tasks
  if (task.status === 'next_action') {
    score += 50
    reasons.push('Ready for action')
  } else if (task.status === 'project') {
    score += 30
    reasons.push('Project work available')
  } else {
    score += 10
  }

  // Priority scoring (1 = highest priority)
  if (task.priority) {
    const priorityScore = (6 - task.priority) * 10
    score += priorityScore
    if (task.priority <= 2) {
      reasons.push('High priority')
    }
  }

  // Due date urgency
  if (task.due_date) {
    const dueDate = new Date(task.due_date)
    const today = new Date()
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilDue < 0) {
      score += 100 // Overdue gets massive boost
      reasons.push('Overdue!')
    } else if (daysUntilDue === 0) {
      score += 75
      reasons.push('Due today')
    } else if (daysUntilDue <= 3) {
      score += 25
      reasons.push('Due soon')
    }
  }

  // Context matching
  if (context.current_location && task.context) {
    const locationContextMap: Record<string, TaskContext[]> = {
      'home': ['home', 'calls', 'computer', 'anywhere'],
      'office': ['office', 'calls', 'computer', 'anywhere'],
      'mobile': ['calls', 'errands', 'anywhere']
    }

    if (locationContextMap[context.current_location]?.includes(task.context)) {
      score += 20
      reasons.push(`Perfect for ${context.current_location}`)
    }
  }

  // Energy level matching
  if (context.current_energy && task.energy_level) {
    if (context.current_energy === task.energy_level) {
      score += 15
      reasons.push('Matches your energy level')
    } else if (
      (context.current_energy === 'high' && task.energy_level === 'medium') ||
      (context.current_energy === 'medium' && task.energy_level === 'low')
    ) {
      score += 5
      reasons.push('Good energy match')
    }
  }

  // Time availability matching
  if (context.available_time && task.estimated_duration) {
    const timeValues: Record<TaskDuration, number> = {
      '5min': 5,
      '15min': 15,
      '30min': 30,
      '1hour': 60,
      '2hour+': 120
    }

    const availableMinutes = timeValues[context.available_time]
    const taskMinutes = timeValues[task.estimated_duration]

    if (taskMinutes <= availableMinutes) {
      score += 15
      reasons.push('Fits in available time')
    } else if (taskMinutes <= availableMinutes * 1.2) {
      score += 5
      reasons.push('Close time match')
    }
  }

  // Recency penalty - avoid suggesting the same tasks repeatedly
  const createdDaysAgo = Math.floor((Date.now() - new Date(task.created_at).getTime()) / (1000 * 60 * 60 * 24))
  if (createdDaysAgo > 7) {
    score += 5 // Slight boost for older tasks
    reasons.push('Needs attention')
  }

  return { score: Math.max(0, score), reasons }
}

function applyTaskFilters(tasks: Task[], filters: TaskFilter): Task[] {
  return tasks.filter(task => {
    // Status filter
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(task.status)) return false
    }

    // Context filter
    if (filters.context && filters.context.length > 0) {
      if (!task.context || !filters.context.includes(task.context)) return false
    }

    // Energy level filter
    if (filters.energy_level && filters.energy_level.length > 0) {
      if (!task.energy_level || !filters.energy_level.includes(task.energy_level)) return false
    }

    // Duration filter
    if (filters.estimated_duration && filters.estimated_duration.length > 0) {
      if (!task.estimated_duration || !filters.estimated_duration.includes(task.estimated_duration)) return false
    }

    // Priority filter
    if (filters.priority && filters.priority.length > 0) {
      if (!task.priority || !filters.priority.includes(task.priority)) return false
    }

    // Due today filter
    if (filters.due_today) {
      if (!task.due_date) return false
      const today = new Date().toDateString()
      const taskDue = new Date(task.due_date).toDateString()
      if (today !== taskDue) return false
    }

    // Overdue filter
    if (filters.overdue) {
      if (!task.due_date) return false
      const today = new Date()
      const dueDate = new Date(task.due_date)
      if (dueDate >= today) return false
    }

    // Project filter
    if (filters.has_project !== undefined) {
      const hasProject = !!task.project_id
      if (hasProject !== filters.has_project) return false
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      if (!task.tags || !filters.tags.some(tag => task.tags!.includes(tag))) return false
    }

    return true
  })
}

export function useEngagement(options: UseEngagementOptions = {}): UseEngagementReturn {
  const { autoRefresh = true, maxSuggestions = 10 } = options
  const { tasks, loading: tasksLoading, updateTask } = useTasks()

  const [context, setContext] = useState<EngagementContext>({
    current_location: 'home',
    current_energy: 'medium',
    available_time: '30min'
  })

  const [activeFilters, setActiveFilters] = useState<TaskFilter>({
    status: ['next_action', 'project']
  })

  const [loading, setLoading] = useState(false)

  // Filter tasks based on active filters
  const filteredTasks = useMemo(() => {
    return applyTaskFilters(tasks, activeFilters)
  }, [tasks, activeFilters])

  // Generate smart suggestions
  const suggestions = useMemo(() => {
    const actionableTasks = tasks.filter(task =>
      task.status === 'next_action' || task.status === 'project'
    )

    const scoredTasks = actionableTasks.map(task => {
      const { score, reasons } = calculateTaskScore(task, context)
      return { task, score, reasons }
    })

    return scoredTasks
      .sort((a, b) => b.score - a.score)
      .slice(0, maxSuggestions)
  }, [tasks, context, maxSuggestions])

  // Update context
  const updateContext = useCallback((newContext: Partial<EngagementContext>) => {
    setContext(prev => ({ ...prev, ...newContext }))
  }, [])

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<TaskFilter>) => {
    setActiveFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  // Execute task actions
  const executeAction = useCallback(async (taskId: string, action: TaskAction) => {
    setLoading(true)
    try {
      switch (action.type) {
        case 'complete':
          await updateTask(taskId, {
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          break

        case 'defer':
          await updateTask(taskId, {
            due_date: action.data?.newDueDate as string | undefined,
            notes: action.data?.reason ?
              `Deferred: ${action.data.reason}` :
              undefined
          })
          break

        case 'delegate':
          await updateTask(taskId, {
            status: 'waiting_for',
            notes: action.data?.delegateTo ?
              `Delegated to: ${action.data.delegateTo}` :
              'Delegated'
          })
          break

        case 'update':
          if (action.data) {
            await updateTask(taskId, action.data as any)
          }
          break

        default:
          throw new Error(`Unknown action type: ${action.type}`)
      }
    } catch (error) {
      console.error('Failed to execute action:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [updateTask])

  // Refresh suggestions
  const refreshSuggestions = useCallback(() => {
    // This will trigger a re-computation of suggestions via the useMemo
    setContext(prev => ({ ...prev }))
  }, [])

  return {
    suggestions,
    filteredTasks,
    activeFilters,
    context,
    loading: loading || tasksLoading,
    updateContext,
    updateFilters,
    executeAction,
    refreshSuggestions
  }
}