import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useTasks } from '@/hooks/useTasks'
import { createMockSupabaseClient } from '../../utils/test-utils'
import { mockTasks, createMockTask, mockSupabaseResponses } from '../../fixtures/data'
import type { CreateTaskInput, UpdateTaskInput } from '@/types/database'

// Mock the Supabase client
vi.mock('@/utils/supabase/client', () => ({
  createClient: vi.fn(),
}))

describe('useTasks', () => {
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
      const { result } = renderHook(() => useTasks({ autoRefresh: false }))

      expect(result.current.loading).toBe(true)
      expect(result.current.tasks).toEqual([])
      expect(result.current.error).toBe(null)
    })

    it('should fetch tasks on mount when autoRefresh is true', async () => {
      mockSupabase.from().single.mockResolvedValue(mockSupabaseResponses.tasks.select)

      const { result } = renderHook(() => useTasks({ autoRefresh: true }))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(mockSupabase.from).toHaveBeenCalledWith('tasks')
      expect(result.current.tasks).toEqual(mockTasks)
    })

    it('should not fetch tasks on mount when autoRefresh is false', () => {
      renderHook(() => useTasks({ autoRefresh: false }))

      expect(mockSupabase.from).not.toHaveBeenCalled()
    })
  })

  describe('createTask', () => {
    it('should create a task successfully', async () => {
      const newTask = createMockTask({ title: 'New Task' })
      mockSupabase.from().single.mockResolvedValue({
        data: newTask,
        error: null,
      })

      const { result } = renderHook(() => useTasks({ autoRefresh: false }))

      const taskInput: CreateTaskInput = {
        title: 'New Task',
        description: 'New task description',
        status: 'captured',
      }

      let createdTask: unknown
      await act(async () => {
        createdTask = await result.current.createTask(taskInput)
      })

      expect(createdTask).toEqual(newTask)
      expect(mockSupabase.from).toHaveBeenCalledWith('tasks')
      expect(mockSupabase.from().insert).toHaveBeenCalledWith({
        ...taskInput,
        status: 'captured',
      })
    })

    it('should handle create task error', async () => {
      const errorMessage = 'Failed to create task'
      mockSupabase.from().single.mockResolvedValue({
        data: null,
        error: { message: errorMessage },
      })

      const { result } = renderHook(() => useTasks({ autoRefresh: false }))

      const taskInput: CreateTaskInput = {
        title: 'New Task',
        status: 'captured',
      }

      await act(async () => {
        await expect(result.current.createTask(taskInput)).rejects.toThrow(errorMessage)
      })

      expect(result.current.error).toBe(errorMessage)
    })

    it('should default status to captured if not provided', async () => {
      const newTask = createMockTask({ title: 'New Task', status: 'captured' })
      mockSupabase.from().single.mockResolvedValue({
        data: newTask,
        error: null,
      })

      const { result } = renderHook(() => useTasks({ autoRefresh: false }))

      const taskInput: CreateTaskInput = {
        title: 'New Task',
        description: 'New task description',
        status: 'captured',
      }

      await act(async () => {
        await result.current.createTask(taskInput)
      })

      expect(mockSupabase.from().insert).toHaveBeenCalledWith({
        ...taskInput,
        status: 'captured',
      })
    })
  })

  describe('updateTask', () => {
    it('should update a task successfully', async () => {
      const updatedTask = { ...mockTasks[0], title: 'Updated Task' }
      mockSupabase.from().single.mockResolvedValue({
        data: updatedTask,
        error: null,
      })

      const { result } = renderHook(() => useTasks({ autoRefresh: false }))

      const updateInput: UpdateTaskInput = {
        title: 'Updated Task',
      }

      let resultTask: unknown
      await act(async () => {
        resultTask = await result.current.updateTask('task-1', updateInput)
      })

      expect(resultTask).toEqual(updatedTask)
      expect(mockSupabase.from().eq).toHaveBeenCalledWith('id', 'task-1')
      expect(mockSupabase.from().update).toHaveBeenCalledWith({
        ...updateInput,
        updated_at: expect.any(String),
      })
    })

    it('should handle update task error', async () => {
      const errorMessage = 'Failed to update task'
      mockSupabase.from().single.mockResolvedValue({
        data: null,
        error: { message: errorMessage },
      })

      const { result } = renderHook(() => useTasks({ autoRefresh: false }))

      const updateInput: UpdateTaskInput = {
        title: 'Updated Task',
      }

      await act(async () => {
        await expect(result.current.updateTask('task-1', updateInput)).rejects.toThrow(errorMessage)
      })

      expect(result.current.error).toBe(errorMessage)
    })
  })

  describe('deleteTask', () => {
    it('should delete a task successfully', async () => {
      mockSupabase.from().delete.mockResolvedValue({
        data: null,
        error: null,
      })

      const { result } = renderHook(() => useTasks({ autoRefresh: false }))

      await act(async () => {
        await result.current.deleteTask('task-1')
      })

      expect(mockSupabase.from().delete).toHaveBeenCalled()
      expect(mockSupabase.from().eq).toHaveBeenCalledWith('id', 'task-1')
    })

    it('should handle delete task error', async () => {
      const errorMessage = 'Failed to delete task'
      mockSupabase.from().delete.mockResolvedValue({
        data: null,
        error: { message: errorMessage },
      })

      const { result } = renderHook(() => useTasks({ autoRefresh: false }))

      await act(async () => {
        await expect(result.current.deleteTask('task-1')).rejects.toThrow(errorMessage)
      })

      expect(result.current.error).toBe(errorMessage)
    })
  })

  describe('optimistic updates', () => {
    it('should add task optimistically', () => {
      const { result } = renderHook(() => useTasks({ autoRefresh: false }))

      const optimisticTask = {
        title: 'Optimistic Task',
        status: 'captured' as const,
      }

      act(() => {
        result.current.optimisticAdd(optimisticTask)
      })

      expect(result.current.tasks).toHaveLength(1)
      expect(result.current.tasks[0]).toMatchObject(optimisticTask)
      expect(result.current.tasks[0].id).toMatch(/^temp-/)
    })

    it('should update task optimistically', () => {
      const { result } = renderHook(() => useTasks({ autoRefresh: false }))

      // First add a task
      act(() => {
        result.current.optimisticAdd({ id: 'task-1', title: 'Original Task' })
      })

      // Then update it
      act(() => {
        result.current.optimisticUpdate('task-1', { title: 'Updated Task' })
      })

      expect(result.current.tasks[0].title).toBe('Updated Task')
      expect(result.current.tasks[0].updated_at).toBeDefined()
    })

    it('should remove task optimistically', () => {
      const { result } = renderHook(() => useTasks({ autoRefresh: false }))

      // First add a task
      act(() => {
        result.current.optimisticAdd({ id: 'task-1', title: 'Task to Remove' })
      })

      expect(result.current.tasks).toHaveLength(1)

      // Then remove it
      act(() => {
        result.current.optimisticRemove('task-1')
      })

      expect(result.current.tasks).toHaveLength(0)
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

      renderHook(() => useTasks({ realTimeSync: true }))

      expect(mockSupabase.channel).toHaveBeenCalledWith('tasks_channel')
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
        },
        expect.any(Function)
      )
      expect(mockChannel.subscribe).toHaveBeenCalled()
    })

    it('should not set up real-time subscription when disabled', () => {
      renderHook(() => useTasks({ realTimeSync: false }))

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

      const { result } = renderHook(() => useTasks({ realTimeSync: true }))

      // Simulate INSERT event
      const newTask = createMockTask({ id: 'new-task' })
      act(() => {
        subscriptionHandler({
          eventType: 'INSERT',
          new: newTask,
        })
      })

      expect(result.current.tasks).toContainEqual(newTask)
    })

    it('should handle UPDATE events from real-time subscription', () => {
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

      const { result } = renderHook(() => useTasks({ realTimeSync: true }))

      // First add a task
      const originalTask = createMockTask({ id: 'task-1', title: 'Original' })
      act(() => {
        result.current.optimisticAdd(originalTask)
      })

      // Simulate UPDATE event
      const updatedTask = { ...originalTask, title: 'Updated' }
      act(() => {
        subscriptionHandler({
          eventType: 'UPDATE',
          new: updatedTask,
        })
      })

      expect(result.current.tasks[0]).toEqual(updatedTask)
    })

    it('should handle DELETE events from real-time subscription', () => {
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

      const { result } = renderHook(() => useTasks({ realTimeSync: true }))

      // First add a task
      const task = createMockTask({ id: 'task-1' })
      act(() => {
        result.current.optimisticAdd(task)
      })

      expect(result.current.tasks).toHaveLength(1)

      // Simulate DELETE event
      act(() => {
        subscriptionHandler({
          eventType: 'DELETE',
          old: { id: 'task-1' },
        })
      })

      expect(result.current.tasks).toHaveLength(0)
    })
  })

  describe('refresh', () => {
    it('should refresh tasks and set loading state', async () => {
      mockSupabase.from().single.mockResolvedValue(mockSupabaseResponses.tasks.select)

      const { result } = renderHook(() => useTasks({ autoRefresh: false }))

      expect(result.current.loading).toBe(true)

      await act(async () => {
        await result.current.refresh()
      })

      expect(result.current.loading).toBe(false)
      expect(result.current.tasks).toEqual(mockTasks)
    })
  })
})