'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useTasks } from './useTasks'
import type { CreateTaskInput, Task } from '@/types/database'

interface OfflineTask extends CreateTaskInput {
  tempId: string
  timestamp: number
}

interface UseTaskCaptureOptions {
  autoSave?: boolean
  autoSaveDelay?: number
  enableOfflineQueue?: boolean
}

interface UseTaskCaptureReturn {
  isOnline: boolean
  isSaving: boolean
  lastSaveTime: Date | null
  error: string | null
  captureTask: (input: CreateTaskInput) => Promise<Task>
  quickCapture: (title: string) => Promise<Task>
  clearError: () => void
  offlineQueueCount: number
  syncOfflineQueue: () => Promise<void>
}

export function useTaskCapture(options: UseTaskCaptureOptions = {}): UseTaskCaptureReturn {
  const {
    enableOfflineQueue = true,
    autoSaveDelay = 2000
  } = options

  const { createTask, optimisticAdd } = useTasks()

  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [offlineQueue, setOfflineQueue] = useState<OfflineTask[]>([])

  const syncTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      // Auto-sync when coming back online
      if (offlineQueue.length > 0) {
        syncOfflineQueue()
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)

      return () => {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
      }
    }
  }, [offlineQueue.length])

  // Load offline queue from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && enableOfflineQueue) {
      try {
        const stored = localStorage.getItem('gtd_offline_tasks')
        if (stored) {
          const parsed = JSON.parse(stored) as OfflineTask[]
          setOfflineQueue(parsed)
        }
      } catch (err) {
        console.warn('Failed to load offline queue:', err)
      }
    }
  }, [enableOfflineQueue])

  // Save offline queue to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && enableOfflineQueue) {
      try {
        localStorage.setItem('gtd_offline_tasks', JSON.stringify(offlineQueue))
      } catch (err) {
        console.warn('Failed to save offline queue:', err)
      }
    }
  }, [offlineQueue, enableOfflineQueue])

  // Add task to offline queue
  const addToOfflineQueue = useCallback((input: CreateTaskInput) => {
    const offlineTask: OfflineTask = {
      ...input,
      tempId: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    }

    setOfflineQueue(prev => [...prev, offlineTask])

    // Add optimistic UI update
    optimisticAdd({
      id: offlineTask.tempId,
      title: offlineTask.title,
      description: offlineTask.description,
      status: offlineTask.status || 'captured',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })

    return offlineTask
  }, [optimisticAdd])

  // Sync offline queue with server
  const syncOfflineQueue = useCallback(async () => {
    if (!isOnline || offlineQueue.length === 0) return

    setIsSaving(true)
    const failedTasks: OfflineTask[] = []

    for (const offlineTask of offlineQueue) {
      try {
        const { tempId, timestamp, ...taskInput } = offlineTask
        await createTask(taskInput)
      } catch (err) {
        console.error('Failed to sync offline task:', err)
        failedTasks.push(offlineTask)
      }
    }

    // Keep only failed tasks in the queue
    setOfflineQueue(failedTasks)
    setIsSaving(false)

    if (failedTasks.length === 0) {
      setLastSaveTime(new Date())
    }
  }, [isOnline, offlineQueue, createTask])

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && offlineQueue.length > 0) {
      // Delay sync slightly to avoid immediate retry on connection flicker
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }

      syncTimeoutRef.current = setTimeout(() => {
        syncOfflineQueue()
      }, 1000)
    }

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
    }
  }, [isOnline, offlineQueue.length, syncOfflineQueue])

  // Main capture function
  const captureTask = useCallback(async (input: CreateTaskInput): Promise<Task> => {
    setError(null)

    // If offline and offline queue is enabled, add to queue
    if (!isOnline && enableOfflineQueue) {
      const offlineTask = addToOfflineQueue(input)
      // Return a mock task for immediate UI feedback
      return {
        id: offlineTask.tempId,
        user_id: '',
        title: offlineTask.title,
        description: offlineTask.description,
        status: offlineTask.status || 'captured',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }

    // Try to save immediately if online
    setIsSaving(true)

    try {
      const task = await createTask(input)
      setLastSaveTime(new Date())
      return task
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to capture task'
      setError(errorMessage)

      // If failed and offline queue is enabled, add to offline queue as fallback
      if (enableOfflineQueue) {
        const offlineTask = addToOfflineQueue(input)
        return {
          id: offlineTask.tempId,
          user_id: '',
          title: offlineTask.title,
          description: offlineTask.description,
          status: offlineTask.status || 'captured',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }

      throw err
    } finally {
      setIsSaving(false)
    }
  }, [isOnline, enableOfflineQueue, createTask, addToOfflineQueue])

  // Quick capture for simple title-only tasks
  const quickCapture = useCallback(async (title: string): Promise<Task> => {
    return captureTask({
      title: title.trim(),
      status: 'captured'
    })
  }, [captureTask])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    isOnline,
    isSaving,
    lastSaveTime,
    error,
    captureTask,
    quickCapture,
    clearError,
    offlineQueueCount: offlineQueue.length,
    syncOfflineQueue
  }
}