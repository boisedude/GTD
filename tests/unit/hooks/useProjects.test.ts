import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useProjects } from '@/hooks/useProjects'
import { createMockSupabaseClient } from '../../utils/test-utils'
import { mockProjects, mockTasks, createMockProject, mockSupabaseResponses } from '../../fixtures/data'
import type { CreateTaskInput } from '@/types/database'

// Mock the Supabase client
vi.mock('@/utils/supabase/client', () => ({
  createClient: vi.fn(),
}))

describe('useProjects', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>

  beforeEach(async () => {
    mockSupabase = createMockSupabaseClient()
    const { createClient } = await import('@/utils/supabase/client')
    ;(createClient as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with loading state', () => {
      const { result } = renderHook(() => useProjects({ autoRefresh: false }))

      expect(result.current.loading).toBe(true)
      expect(result.current.projects).toEqual([])
      expect(result.current.error).toBe(null)
    })

    it('should fetch projects on mount when autoRefresh is true', async () => {
      mockSupabase.from().single.mockResolvedValue(mockSupabaseResponses.projects.select)

      const { result } = renderHook(() => useProjects({ autoRefresh: true }))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(mockSupabase.from).toHaveBeenCalledWith('projects')
      expect(result.current.projects).toEqual(mockProjects)
    })
  })

  describe('createProject', () => {
    it('should create a project successfully', async () => {
      const newProject = createMockProject({ name: 'New Project' })
      mockSupabase.from().single.mockResolvedValue({
        data: newProject,
        error: null,
      })

      const { result } = renderHook(() => useProjects({ autoRefresh: false }))

      const projectInput = {
        name: 'New Project',
        status: 'active' as const,
      }

      let createdProject: unknown
      await act(async () => {
        createdProject = await result.current.createProject(projectInput)
      })

      expect(createdProject).toEqual(newProject)
      expect(mockSupabase.from).toHaveBeenCalledWith('projects')
      expect(mockSupabase.from().insert).toHaveBeenCalledWith({
        ...projectInput,
        status: 'active',
      })
    })

    it('should default status to active if not provided', async () => {
      const newProject = createMockProject({ name: 'New Project', status: 'active' })
      mockSupabase.from().single.mockResolvedValue({
        data: newProject,
        error: null,
      })

      const { result } = renderHook(() => useProjects({ autoRefresh: false }))

      const projectInput = {
        name: 'New Project',
      }

      await act(async () => {
        await result.current.createProject(projectInput)
      })

      expect(mockSupabase.from().insert).toHaveBeenCalledWith({
        ...projectInput,
        status: 'active',
      })
    })

    it('should handle create project error', async () => {
      const errorMessage = 'Failed to create project'
      mockSupabase.from().single.mockResolvedValue({
        data: null,
        error: { message: errorMessage },
      })

      const { result } = renderHook(() => useProjects({ autoRefresh: false }))

      const projectInput = {
        name: 'New Project',
      }

      await act(async () => {
        await expect(result.current.createProject(projectInput)).rejects.toThrow(errorMessage)
      })

      expect(result.current.error).toBe(errorMessage)
    })
  })

  describe('updateProject', () => {
    it('should update a project successfully', async () => {
      const updatedProject = { ...mockProjects[0], name: 'Updated Project' }
      mockSupabase.from().single.mockResolvedValue({
        data: updatedProject,
        error: null,
      })

      const { result } = renderHook(() => useProjects({ autoRefresh: false }))

      const updateInput = {
        name: 'Updated Project',
      }

      let resultProject: unknown
      await act(async () => {
        resultProject = await result.current.updateProject('project-1', updateInput)
      })

      expect(resultProject).toEqual(updatedProject)
      expect(mockSupabase.from().eq).toHaveBeenCalledWith('id', 'project-1')
      expect(mockSupabase.from().update).toHaveBeenCalledWith({
        ...updateInput,
        updated_at: expect.any(String),
      })
    })

    it('should handle update project error', async () => {
      const errorMessage = 'Failed to update project'
      mockSupabase.from().single.mockResolvedValue({
        data: null,
        error: { message: errorMessage },
      })

      const { result } = renderHook(() => useProjects({ autoRefresh: false }))

      const updateInput = {
        name: 'Updated Project',
      }

      await act(async () => {
        await expect(result.current.updateProject('project-1', updateInput)).rejects.toThrow(errorMessage)
      })

      expect(result.current.error).toBe(errorMessage)
    })
  })

  describe('deleteProject', () => {
    it('should delete a project successfully when no tasks exist', async () => {
      // Mock no tasks for the project
      mockSupabase.from().select.mockResolvedValueOnce({
        data: [],
        error: null,
      })

      // Mock successful delete
      mockSupabase.from().delete.mockResolvedValue({
        data: null,
        error: null,
      })

      const { result } = renderHook(() => useProjects({ autoRefresh: false }))

      await act(async () => {
        await result.current.deleteProject('project-1')
      })

      expect(mockSupabase.from().select).toHaveBeenCalledWith('id')
      expect(mockSupabase.from().eq).toHaveBeenCalledWith('project_id', 'project-1')
      expect(mockSupabase.from().delete).toHaveBeenCalled()
      expect(mockSupabase.from().eq).toHaveBeenCalledWith('id', 'project-1')
    })

    it('should prevent deletion when project has tasks', async () => {
      // Mock tasks exist for the project
      mockSupabase.from().select.mockResolvedValueOnce({
        data: [{ id: 'task-1' }, { id: 'task-2' }],
        error: null,
      })

      const { result } = renderHook(() => useProjects({ autoRefresh: false }))

      await act(async () => {
        await expect(result.current.deleteProject('project-1')).rejects.toThrow(
          'Cannot delete project with 2 associated tasks. Please remove or reassign tasks first.'
        )
      })

      expect(mockSupabase.from().delete).not.toHaveBeenCalled()
    })

    it('should handle delete project error', async () => {
      // Mock no tasks for the project
      mockSupabase.from().select.mockResolvedValueOnce({
        data: [],
        error: null,
      })

      const errorMessage = 'Failed to delete project'
      mockSupabase.from().delete.mockResolvedValue({
        data: null,
        error: { message: errorMessage },
      })

      const { result } = renderHook(() => useProjects({ autoRefresh: false }))

      await act(async () => {
        await expect(result.current.deleteProject('project-1')).rejects.toThrow(errorMessage)
      })

      expect(result.current.error).toBe(errorMessage)
    })
  })

  describe('getProjectTasks', () => {
    it('should fetch tasks for a project successfully', async () => {
      const projectTasks = mockTasks.filter(task => task.project_id === 'project-1')
      mockSupabase.from().order.mockResolvedValue({
        data: projectTasks,
        error: null,
      })

      const { result } = renderHook(() => useProjects({ autoRefresh: false }))

      let tasks: unknown
      await act(async () => {
        tasks = await result.current.getProjectTasks('project-1')
      })

      expect(tasks).toEqual(projectTasks)
      expect(mockSupabase.from).toHaveBeenCalledWith('tasks')
      expect(mockSupabase.from().eq).toHaveBeenCalledWith('project_id', 'project-1')
    })

    it('should handle get project tasks error', async () => {
      const errorMessage = 'Failed to fetch project tasks'
      mockSupabase.from().order.mockResolvedValue({
        data: null,
        error: { message: errorMessage },
      })

      const { result } = renderHook(() => useProjects({ autoRefresh: false }))

      await act(async () => {
        await expect(result.current.getProjectTasks('project-1')).rejects.toThrow(errorMessage)
      })

      expect(result.current.error).toBe(errorMessage)
    })
  })

  describe('addTaskToProject', () => {
    it('should add a task to a project successfully', async () => {
      const newTask = { ...mockTasks[0], project_id: 'project-1', status: 'next_action' as const }
      mockSupabase.from().single.mockResolvedValue({
        data: newTask,
        error: null,
      })

      const { result } = renderHook(() => useProjects({ autoRefresh: false }))

      const taskInput: CreateTaskInput = {
        title: 'New Project Task',
        status: 'captured',
      }

      let createdTask: unknown
      await act(async () => {
        createdTask = await result.current.addTaskToProject('project-1', taskInput)
      })

      expect(createdTask).toEqual(newTask)
      expect(mockSupabase.from).toHaveBeenCalledWith('tasks')
      expect(mockSupabase.from().insert).toHaveBeenCalledWith({
        ...taskInput,
        project_id: 'project-1',
        status: 'next_action', // Should default to next_action for project tasks
      })
    })

    it('should default status to next_action for project tasks', async () => {
      const newTask = { ...mockTasks[0], project_id: 'project-1', status: 'next_action' as const }
      mockSupabase.from().single.mockResolvedValue({
        data: newTask,
        error: null,
      })

      const { result } = renderHook(() => useProjects({ autoRefresh: false }))

      const taskInput: CreateTaskInput = {
        title: 'New Project Task',
        status: 'captured',
      }

      await act(async () => {
        await result.current.addTaskToProject('project-1', taskInput)
      })

      expect(mockSupabase.from().insert).toHaveBeenCalledWith({
        ...taskInput,
        project_id: 'project-1',
        status: 'next_action',
      })
    })

    it('should handle add task to project error', async () => {
      const errorMessage = 'Failed to add task to project'
      mockSupabase.from().single.mockResolvedValue({
        data: null,
        error: { message: errorMessage },
      })

      const { result } = renderHook(() => useProjects({ autoRefresh: false }))

      const taskInput: CreateTaskInput = {
        title: 'New Project Task',
        status: 'captured',
      }

      await act(async () => {
        await expect(result.current.addTaskToProject('project-1', taskInput)).rejects.toThrow(errorMessage)
      })

      expect(result.current.error).toBe(errorMessage)
    })
  })

  describe('real-time sync', () => {
    it('should set up real-time subscription when enabled', () => {
      const mockSubscription = { unsubscribe: vi.fn() }
      const mockChannel = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnValue(mockSubscription),
        unsubscribe: vi.fn(),
      }
      mockSupabase.channel.mockReturnValue(mockChannel)

      renderHook(() => useProjects({ realTimeSync: true }))

      expect(mockSupabase.channel).toHaveBeenCalledWith('projects_channel')
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
        },
        expect.any(Function)
      )
      expect(mockChannel.subscribe).toHaveBeenCalled()
    })

    it('should not set up real-time subscription when disabled', () => {
      renderHook(() => useProjects({ realTimeSync: false }))

      expect(mockSupabase.channel).not.toHaveBeenCalled()
    })

    it('should handle INSERT events from real-time subscription', () => {
      let subscriptionHandler: (payload: { eventType: string; new?: unknown; old?: unknown }) => void
      const mockChannel = {
        on: vi.fn((event, config, handler) => {
          subscriptionHandler = handler
          return mockChannel
        }),
        subscribe: vi.fn(),
        unsubscribe: vi.fn(),
      }
      mockSupabase.channel.mockReturnValue(mockChannel)

      const { result } = renderHook(() => useProjects({ realTimeSync: true }))

      // Simulate INSERT event
      const newProject = createMockProject({ id: 'new-project' })
      act(() => {
        subscriptionHandler({
          eventType: 'INSERT',
          new: newProject,
        })
      })

      expect(result.current.projects).toContainEqual(newProject)
    })
  })

  describe('refresh', () => {
    it('should refresh projects and set loading state', async () => {
      mockSupabase.from().single.mockResolvedValue(mockSupabaseResponses.projects.select)

      const { result } = renderHook(() => useProjects({ autoRefresh: false }))

      expect(result.current.loading).toBe(true)

      await act(async () => {
        await result.current.refresh()
      })

      expect(result.current.loading).toBe(false)
      expect(result.current.projects).toEqual(mockProjects)
    })
  })
})