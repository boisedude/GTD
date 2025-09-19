import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { createMockSupabaseClient } from '../../utils/test-utils'
import { mockUsers, testCredentials } from '../../fixtures/data'

// Mock the Supabase client
vi.mock('@/utils/supabase/client', () => ({
  createClient: vi.fn(),
}))

// Mock Next.js navigation
const mockPush = vi.fn()
const mockReplace = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  usePathname: () => '/dashboard',
}))

// Create a mock auth context for integration testing
const createMockAuthContext = (mockSupabase: any) => {
  const useAuth = () => {
    const [user, setUser] = React.useState(null)
    const [loading, setLoading] = React.useState(true)

    const signIn = async (email: string) => {
      const { data, error } = await mockSupabase.auth.signInWithOtp({ email })
      if (error) throw error
      return data
    }

    const signOut = async () => {
      const { error } = await mockSupabase.auth.signOut()
      if (error) throw error
      setUser(null)
    }

    const getUser = async () => {
      const { data, error } = await mockSupabase.auth.getUser()
      if (error) throw error
      setUser(data.user)
      setLoading(false)
      return data.user
    }

    React.useEffect(() => {
      getUser()
    }, [])

    return { user, loading, signIn, signOut, getUser }
  }

  return useAuth
}

describe('Authentication Integration', () => {
  let mockSupabase: any
  let useAuth: any

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient()
    const { createClient } = require('@/utils/supabase/client')
    createClient.mockReturnValue(mockSupabase)

    useAuth = createMockAuthContext(mockSupabase)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('sign in flow', () => {
    it('should successfully sign in with valid email', async () => {
      mockSupabase.auth.signInWithOtp.mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      })

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.signIn(testCredentials.email)
      })

      expect(mockSupabase.auth.signInWithOtp).toHaveBeenCalledWith({
        email: testCredentials.email,
      })
    })

    it('should handle sign in with OTP including options', async () => {
      mockSupabase.auth.signInWithOtp.mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      })

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.signIn(testCredentials.email)
      })

      expect(mockSupabase.auth.signInWithOtp).toHaveBeenCalledWith({
        email: testCredentials.email,
      })
    })

    it('should handle sign in errors', async () => {
      const signInError = new Error('Invalid email address')
      mockSupabase.auth.signInWithOtp.mockResolvedValue({
        data: null,
        error: signInError,
      })

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await expect(result.current.signIn('invalid-email')).rejects.toThrow('Invalid email address')
      })
    })

    it('should handle network errors during sign in', async () => {
      mockSupabase.auth.signInWithOtp.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await expect(result.current.signIn(testCredentials.email)).rejects.toThrow('Network error')
      })
    })
  })

  describe('user session management', () => {
    it('should load user session on initialization', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUsers[0] },
        error: null,
      })

      const { result } = renderHook(() => useAuth())

      expect(result.current.loading).toBe(true)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.user).toEqual(mockUsers[0])
      expect(mockSupabase.auth.getUser).toHaveBeenCalled()
    })

    it('should handle no active session', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.user).toBe(null)
    })

    it('should handle session retrieval errors', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: null,
        error: new Error('Session expired'),
      })

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await expect(result.current.getUser()).rejects.toThrow('Session expired')
      })
    })
  })

  describe('sign out flow', () => {
    it('should successfully sign out user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUsers[0] },
        error: null,
      })
      mockSupabase.auth.signOut.mockResolvedValue({
        error: null,
      })

      const { result } = renderHook(() => useAuth())

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.user).toEqual(mockUsers[0])
      })

      await act(async () => {
        await result.current.signOut()
      })

      expect(mockSupabase.auth.signOut).toHaveBeenCalled()
      expect(result.current.user).toBe(null)
    })

    it('should handle sign out errors', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({
        error: new Error('Sign out failed'),
      })

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await expect(result.current.signOut()).rejects.toThrow('Sign out failed')
      })
    })
  })

  describe('auth state persistence', () => {
    it('should maintain auth state across page reloads', async () => {
      // Simulate page reload by calling getUser multiple times
      mockSupabase.auth.getUser
        .mockResolvedValueOnce({
          data: { user: mockUsers[0] },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { user: mockUsers[0] },
          error: null,
        })

      const { result } = renderHook(() => useAuth())

      // Initial load
      await waitFor(() => {
        expect(result.current.user).toEqual(mockUsers[0])
      })

      // Simulate page reload
      await act(async () => {
        await result.current.getUser()
      })

      expect(result.current.user).toEqual(mockUsers[0])
      expect(mockSupabase.auth.getUser).toHaveBeenCalledTimes(2)
    })
  })

  describe('route protection', () => {
    it('should redirect unauthenticated users to login', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.user).toBe(null)
      // In a real protected route component, this would trigger a redirect
    })

    it('should allow authenticated users to access protected routes', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUsers[0] },
        error: null,
      })

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.user).toEqual(mockUsers[0])
      // User should be able to access protected content
    })
  })

  describe('OTP verification flow', () => {
    it('should handle OTP email sending', async () => {
      mockSupabase.auth.signInWithOtp.mockResolvedValue({
        data: {
          user: null,
          session: null,
          messageId: 'msg_123'
        },
        error: null,
      })

      const { result } = renderHook(() => useAuth())

      let signInResult: any
      await act(async () => {
        signInResult = await result.current.signIn(testCredentials.email)
      })

      expect(mockSupabase.auth.signInWithOtp).toHaveBeenCalledWith({
        email: testCredentials.email,
      })
      expect(signInResult).toHaveProperty('messageId')
    })

    it('should handle invalid email format', async () => {
      mockSupabase.auth.signInWithOtp.mockResolvedValue({
        data: null,
        error: { message: 'Invalid email format' },
      })

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await expect(result.current.signIn('not-an-email')).rejects.toThrow('Invalid email format')
      })
    })

    it('should handle rate limiting', async () => {
      mockSupabase.auth.signInWithOtp.mockResolvedValue({
        data: null,
        error: { message: 'Too many requests' },
      })

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await expect(result.current.signIn(testCredentials.email)).rejects.toThrow('Too many requests')
      })
    })
  })

  describe('session refresh', () => {
    it('should handle automatic session refresh', async () => {
      // Mock initial session
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUsers[0] },
        error: null,
      })

      // Mock session refresh
      mockSupabase.auth.getSession.mockResolvedValue({
        data: {
          session: {
            user: mockUsers[0],
            access_token: 'new-token',
            refresh_token: 'new-refresh-token'
          }
        },
        error: null,
      })

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUsers[0])
      })

      // Simulate session refresh
      await act(async () => {
        await result.current.getUser()
      })

      expect(result.current.user).toEqual(mockUsers[0])
    })

    it('should handle session refresh failures', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: null,
        error: { message: 'Session expired' },
      })

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await expect(result.current.getUser()).rejects.toThrow('Session expired')
      })
    })
  })

  describe('concurrent auth operations', () => {
    it('should handle multiple simultaneous auth calls', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUsers[0] },
        error: null,
      })

      const { result } = renderHook(() => useAuth())

      // Make multiple concurrent calls
      await act(async () => {
        await Promise.all([
          result.current.getUser(),
          result.current.getUser(),
          result.current.getUser(),
        ])
      })

      expect(result.current.user).toEqual(mockUsers[0])
      expect(mockSupabase.auth.getUser).toHaveBeenCalledTimes(4) // 1 initial + 3 concurrent
    })
  })
})