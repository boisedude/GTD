'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { Project, CreateTaskInput, Task } from '@/types/database'

interface CreateProjectInput {
  name: string
  status?: 'active' | 'complete'
}

interface UpdateProjectInput {
  name?: string
  status?: 'active' | 'complete'
}

interface UseProjectsOptions {
  autoRefresh?: boolean
  realTimeSync?: boolean
}

interface UseProjectsReturn {
  projects: Project[]
  loading: boolean
  error: string | null
  createProject: (input: CreateProjectInput) => Promise<Project>
  updateProject: (id: string, input: UpdateProjectInput) => Promise<Project>
  deleteProject: (id: string) => Promise<void>
  getProjectTasks: (projectId: string) => Promise<Task[]>
  addTaskToProject: (projectId: string, taskInput: CreateTaskInput) => Promise<Task>
  refresh: () => Promise<void>
}

export function useProjects(options: UseProjectsOptions = {}): UseProjectsReturn {
  const { autoRefresh = true, realTimeSync = true } = options

  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()
  const subscribedRef = useRef(false)

  // Fetch projects from Supabase
  const fetchProjects = useCallback(async () => {
    try {
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      setProjects(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects')
      console.error('Error fetching projects:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Create a new project
  const createProject = useCallback(async (input: CreateProjectInput): Promise<Project> => {
    try {
      setError(null)

      const { data, error: createError } = await supabase
        .from('projects')
        .insert({
          ...input,
          status: input.status || 'active'
        })
        .select()
        .single()

      if (createError) {
        throw new Error(createError.message)
      }

      if (!data) {
        throw new Error('No data returned from project creation')
      }

      // Update local state optimistically if real-time is disabled
      if (!realTimeSync) {
        setProjects(prev => [data, ...prev])
      }

      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create project'
      setError(errorMessage)
      throw err
    }
  }, [supabase, realTimeSync])

  // Update an existing project
  const updateProject = useCallback(async (id: string, input: UpdateProjectInput): Promise<Project> => {
    try {
      setError(null)

      const { data, error: updateError } = await supabase
        .from('projects')
        .update({
          ...input,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (updateError) {
        throw new Error(updateError.message)
      }

      if (!data) {
        throw new Error('No data returned from project update')
      }

      // Update local state optimistically if real-time is disabled
      if (!realTimeSync) {
        setProjects(prev => prev.map(project => project.id === id ? data : project))
      }

      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update project'
      setError(errorMessage)
      throw err
    }
  }, [supabase, realTimeSync])

  // Delete a project
  const deleteProject = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null)

      // First, check if project has tasks
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id')
        .eq('project_id', id)

      if (tasksError) {
        throw new Error(tasksError.message)
      }

      if (tasks && tasks.length > 0) {
        throw new Error(`Cannot delete project with ${tasks.length} associated tasks. Please remove or reassign tasks first.`)
      }

      const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

      if (deleteError) {
        throw new Error(deleteError.message)
      }

      // Update local state optimistically if real-time is disabled
      if (!realTimeSync) {
        setProjects(prev => prev.filter(project => project.id !== id))
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete project'
      setError(errorMessage)
      throw err
    }
  }, [supabase, realTimeSync])

  // Get tasks for a specific project
  const getProjectTasks = useCallback(async (projectId: string): Promise<Task[]> => {
    try {
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      return data || []
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch project tasks'
      setError(errorMessage)
      throw err
    }
  }, [supabase])

  // Add a task to a project
  const addTaskToProject = useCallback(async (projectId: string, taskInput: CreateTaskInput): Promise<Task> => {
    try {
      setError(null)

      const { data, error: createError } = await supabase
        .from('tasks')
        .insert({
          ...taskInput,
          project_id: projectId,
          status: taskInput.status || 'next_action' // Default to next_action for project tasks
        })
        .select()
        .single()

      if (createError) {
        throw new Error(createError.message)
      }

      if (!data) {
        throw new Error('No data returned from task creation')
      }

      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add task to project'
      setError(errorMessage)
      throw err
    }
  }, [supabase])

  // Refresh projects
  const refresh = useCallback(async () => {
    setLoading(true)
    await fetchProjects()
  }, [fetchProjects])

  // Set up real-time subscription
  useEffect(() => {
    if (!realTimeSync || subscribedRef.current) return

    const subscription = supabase
      .channel('projects_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects'
        },
        (payload) => {
          switch (payload.eventType) {
            case 'INSERT':
              if (payload.new) {
                setProjects(prev => {
                  // Avoid duplicates
                  const exists = prev.some(project => project.id === payload.new.id)
                  if (exists) return prev
                  return [payload.new as Project, ...prev]
                })
              }
              break

            case 'UPDATE':
              if (payload.new) {
                setProjects(prev => prev.map(project =>
                  project.id === payload.new.id ? payload.new as Project : project
                ))
              }
              break

            case 'DELETE':
              if (payload.old) {
                setProjects(prev => prev.filter(project => project.id !== payload.old.id))
              }
              break
          }
        }
      )
      .subscribe()

    subscribedRef.current = true

    return () => {
      subscription.unsubscribe()
      subscribedRef.current = false
    }
  }, [supabase, realTimeSync])

  // Initial fetch
  useEffect(() => {
    if (autoRefresh) {
      fetchProjects()
    }
  }, [fetchProjects, autoRefresh])

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    getProjectTasks,
    addTaskToProject,
    refresh
  }
}