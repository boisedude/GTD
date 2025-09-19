import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { vi } from 'vitest'
import { AuthProvider } from '@/contexts/auth-context'
import { mockUsers } from '../fixtures/data'

// Mock AuthContext provider for testing
const MockAuthProvider: React.FC<{ children: React.ReactNode; user?: any }> = ({
  children,
  user = mockUsers[0]
}) => {
  // For testing, we'll use the real AuthProvider but with mocked Supabase client
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  user?: any
  withAuth?: boolean
}

// Custom render function that includes providers
const customRender = (
  ui: ReactElement,
  {
    user = mockUsers[0],
    withAuth = true,
    ...renderOptions
  }: CustomRenderOptions = {}
) => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (withAuth) {
      return <MockAuthProvider user={user}>{children}</MockAuthProvider>
    }
    return <>{children}</>
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Wait for a condition to be met
export const waitFor = async (
  callback: () => boolean | Promise<boolean>,
  options: { timeout?: number; interval?: number } = {}
) => {
  const { timeout = 5000, interval = 50 } = options
  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    if (await callback()) {
      return
    }
    await new Promise(resolve => setTimeout(resolve, interval))
  }

  throw new Error(`Condition not met within ${timeout}ms`)
}

// Create a mock Supabase client
export const createMockSupabaseClient = (overrides: any = {}) => {
  const defaultClient = {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: mockUsers[0] }, error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: { user: mockUsers[0] } }, error: null }),
      signInWithOtp: vi.fn().mockResolvedValue({ data: {}, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockUsers[0], error: null }),
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
    })),
  }

  return { ...defaultClient, ...overrides }
}

// Mock implementation for localStorage
export const mockLocalStorage = () => {
  const store: Record<string, string> = {}

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key])
    }),
  }
}

// Create a mock timer for testing time-dependent functionality
export const createMockTimer = () => {
  let currentTime = 0

  return {
    getCurrentTime: () => currentTime,
    advance: (ms: number) => {
      currentTime += ms
      vi.advanceTimersByTime(ms)
    },
    reset: () => {
      currentTime = 0
      vi.clearAllTimers()
    },
  }
}

// Mock fetch responses
export const mockFetch = (response: any, status = 200) => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(response),
    text: vi.fn().mockResolvedValue(JSON.stringify(response)),
  })
}

// Helper to simulate user interactions
export const userInteractions = {
  type: async (element: HTMLElement, text: string) => {
    const { userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()
    await user.type(element, text)
  },
  click: async (element: HTMLElement) => {
    const { userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()
    await user.click(element)
  },
  select: async (element: HTMLElement, option: string) => {
    const { userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()
    await user.selectOptions(element, option)
  },
  keyboard: async (keys: string) => {
    const { userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()
    await user.keyboard(keys)
  },
}

// Test data generators
export const testData = {
  randomString: (length = 10) =>
    Math.random().toString(36).substring(2, length + 2),
  randomEmail: () =>
    `test.${testData.randomString(5)}@example.com`,
  randomDate: () =>
    new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30).toISOString(),
}

// Performance testing helpers
export const performanceHelpers = {
  measureRenderTime: async (renderFn: () => void) => {
    const start = performance.now()
    renderFn()
    const end = performance.now()
    return end - start
  },
  measureAsyncOperation: async (asyncFn: () => Promise<void>) => {
    const start = performance.now()
    await asyncFn()
    const end = performance.now()
    return end - start
  },
}

// Export everything including the custom render
export * from '@testing-library/react'
export { customRender as render }
export { vi as jest } // For compatibility with existing test patterns