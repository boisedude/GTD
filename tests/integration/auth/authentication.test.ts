import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, rtlWaitFor } from "../../utils/test-utils";
import { useAuth } from "@/contexts/auth-context";
import { createMockSupabaseClient } from "../../utils/test-utils";

// Mock Supabase client
vi.mock("@/utils/supabase/client", () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}));

let mockSupabaseClient: ReturnType<typeof createMockSupabaseClient>;

describe("Authentication Integration", () => {
  beforeEach(() => {
    mockSupabaseClient = createMockSupabaseClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe("useAuth hook integration", () => {
    it("should initialize with loading state", () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.loading).toBe(true);
      expect(result.current.user).toBe(null);
    });

    it("should load authenticated user on mount", async () => {
      const mockUser = {
        id: "user-1",
        email: "test@example.com",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await rtlWaitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.user).toEqual(mockUser);
      });
    });

    it("should handle no authenticated user", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await rtlWaitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.user).toBe(null);
      });
    });

    it("should handle authentication errors", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: "Session expired" },
      });

      const { result } = renderHook(() => useAuth());

      await rtlWaitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.user).toBe(null);
      });
    });
  });

  describe("sign in workflow", () => {
    it("should handle successful OTP sign in", async () => {
      mockSupabaseClient.auth.signInWithOtpWithOtp.mockResolvedValue({
        data: {},
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await rtlWaitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const signInWithOtpResult = await result.current.signInWithOtp("test@example.com");

      expect(mockSupabaseClient.auth.signInWithOtpWithOtp).toHaveBeenCalledWith({
        email: "test@example.com",
        options: {
          emailRedirectTo: expect.stringContaining("/auth/callback"),
        },
      });

      expect(signInWithOtpResult).toEqual({ success: true });
    });

    it("should handle sign in errors", async () => {
      mockSupabaseClient.auth.signInWithOtpWithOtp.mockResolvedValue({
        data: {},
        error: { message: "Invalid email address" },
      });

      const { result } = renderHook(() => useAuth());

      await rtlWaitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const signInWithOtpResult = await result.current.signInWithOtp("invalid-email");

      expect(signInWithOtpResult).toEqual({
        success: false,
        error: "Invalid email address",
      });
    });

    it("should handle network errors during sign in", async () => {
      mockSupabaseClient.auth.signInWithOtpWithOtp.mockRejectedValue(
        new Error("Network error")
      );

      const { result } = renderHook(() => useAuth());

      await rtlWaitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const signInWithOtpResult = await result.current.signInWithOtp("test@example.com");

      expect(signInWithOtpResult).toEqual({
        success: false,
        error: "Network error",
      });
    });

    it("should validate email format before sign in", async () => {
      const { result } = renderHook(() => useAuth());

      await rtlWaitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const signInWithOtpResult = await result.current.signInWithOtp("invalid-email");

      expect(signInWithOtpResult).toEqual({
        success: false,
        error: "Please enter a valid email address",
      });

      expect(mockSupabaseClient.auth.signInWithOtpWithOtp).not.toHaveBeenCalled();
    });

    it("should trim whitespace from email", async () => {
      mockSupabaseClient.auth.signInWithOtpWithOtp.mockResolvedValue({
        data: {},
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await rtlWaitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.signInWithOtp("  test@example.com  ");

      expect(mockSupabaseClient.auth.signInWithOtpWithOtp).toHaveBeenCalledWith({
        email: "test@example.com",
        options: {
          emailRedirectTo: expect.stringContaining("/auth/callback"),
        },
      });
    });
  });

  describe("sign out workflow", () => {
    it("should handle successful sign out", async () => {
      mockSupabaseClient.auth.signOut.mockResolvedValue({ error: null });

      const { result } = renderHook(() => useAuth());

      await rtlWaitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const signOutResult = await result.current.signOut();

      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
      expect(signOutResult).toEqual({ success: true });
    });

    it("should handle sign out errors", async () => {
      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: { message: "Sign out failed" },
      });

      const { result } = renderHook(() => useAuth());

      await rtlWaitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const signOutResult = await result.current.signOut();

      expect(signOutResult).toEqual({
        success: false,
        error: "Sign out failed",
      });
    });

    it("should handle network errors during sign out", async () => {
      mockSupabaseClient.auth.signOut.mockRejectedValue(
        new Error("Network error")
      );

      const { result } = renderHook(() => useAuth());

      await rtlWaitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const signOutResult = await result.current.signOut();

      expect(signOutResult).toEqual({
        success: false,
        error: "Network error",
      });
    });
  });

  describe("authentication state changes", () => {
    it("should listen for auth state changes", () => {
      renderHook(() => useAuth());

      expect(mockSupabaseClient.auth.onAuthStateChange).toHaveBeenCalledWith(
        expect.any(Function)
      );
    });

    it("should update user state on auth change", async () => {
      let authChangeCallback: ((event: string, session: any) => void) | null = null;

      mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
        authChangeCallback = callback;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      const { result } = renderHook(() => useAuth());

      await rtlWaitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Simulate sign in
      const mockUser = {
        id: "user-1",
        email: "test@example.com",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      };

      authChangeCallback?.("SIGNED_IN", { user: mockUser });

      await rtlWaitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      // Simulate sign out
      authChangeCallback?.("SIGNED_OUT", null);

      await rtlWaitFor(() => {
        expect(result.current.user).toBe(null);
      });
    });

    it("should cleanup auth listener on unmount", () => {
      const mockUnsubscribe = vi.fn();
      mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      });

      const { unmount } = renderHook(() => useAuth());

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  describe("session management", () => {
    it("should check for existing session on mount", async () => {
      const mockSession = {
        user: {
          id: "user-1",
          email: "test@example.com",
          created_at: "2023-01-01T00:00:00Z",
          updated_at: "2023-01-01T00:00:00Z",
        },
      };

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await rtlWaitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.user).toEqual(mockSession.user);
      });

      expect(mockSupabaseClient.auth.getSession).toHaveBeenCalled();
    });

    it("should handle session errors", async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: { message: "Session invalid" },
      });

      const { result } = renderHook(() => useAuth());

      await rtlWaitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.user).toBe(null);
      });
    });

    it("should refresh user when session changes", async () => {
      let authChangeCallback: ((event: string, session: any) => void) | null = null;

      mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
        authChangeCallback = callback;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      const { result } = renderHook(() => useAuth());

      await rtlWaitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Simulate token refresh
      const mockUser = {
        id: "user-1",
        email: "test@example.com",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      };

      authChangeCallback?.("TOKEN_REFRESHED", { user: mockUser });

      await rtlWaitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });
    });
  });

  describe("email validation", () => {
    it("should validate valid email formats", async () => {
      const validEmails = [
        "test@example.com",
        "user.name@domain.co.uk",
        "user+tag@example.org",
        "123@test.com",
      ];

      mockSupabaseClient.auth.signInWithOtpWithOtp.mockResolvedValue({
        data: {},
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await rtlWaitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      for (const email of validEmails) {
        const signInWithOtpResult = await result.current.signInWithOtp(email);
        expect(signInWithOtpResult.success).toBe(true);
      }
    });

    it("should reject invalid email formats", async () => {
      const invalidEmails = [
        "invalid-email",
        "@example.com",
        "test@",
        "test..test@example.com",
        "test@.com",
        "",
        "   ",
      ];

      const { result } = renderHook(() => useAuth());

      await rtlWaitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      for (const email of invalidEmails) {
        const signInWithOtpResult = await result.current.signInWithOtp(email);
        expect(signInWithOtpResult.success).toBe(false);
        expect(signInWithOtpResult.error).toContain("valid email");
      }

      expect(mockSupabaseClient.auth.signInWithOtpWithOtp).not.toHaveBeenCalled();
    });
  });

  describe("redirect URL handling", () => {
    it("should include correct redirect URL for development", async () => {
      // Mock development environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      mockSupabaseClient.auth.signInWithOtpWithOtp.mockResolvedValue({
        data: {},
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await rtlWaitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.signInWithOtp("test@example.com");

      expect(mockSupabaseClient.auth.signInWithOtpWithOtp).toHaveBeenCalledWith({
        email: "test@example.com",
        options: {
          emailRedirectTo: expect.stringContaining("localhost"),
        },
      });

      process.env.NODE_ENV = originalEnv;
    });

    it("should include correct redirect URL for production", async () => {
      // Mock production environment
      const originalEnv = process.env.NODE_ENV;
      const originalUrl = process.env.NEXT_PUBLIC_VERCEL_URL;
      process.env.NODE_ENV = "production";
      process.env.NEXT_PUBLIC_VERCEL_URL = "myapp.vercel.app";

      mockSupabaseClient.auth.signInWithOtpWithOtp.mockResolvedValue({
        data: {},
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await rtlWaitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.signInWithOtp("test@example.com");

      expect(mockSupabaseClient.auth.signInWithOtpWithOtp).toHaveBeenCalledWith({
        email: "test@example.com",
        options: {
          emailRedirectTo: expect.stringContaining("myapp.vercel.app"),
        },
      });

      process.env.NODE_ENV = originalEnv;
      process.env.NEXT_PUBLIC_VERCEL_URL = originalUrl;
    });
  });

  describe("race conditions and edge cases", () => {
    it("should handle rapid sign in/out cycles", async () => {
      let authChangeCallback: ((event: string, session: any) => void) | null = null;

      mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
        authChangeCallback = callback;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      mockSupabaseClient.auth.signInWithOtpWithOtp.mockResolvedValue({
        data: {},
        error: null,
      });

      mockSupabaseClient.auth.signOut.mockResolvedValue({ error: null });

      const { result } = renderHook(() => useAuth());

      await rtlWaitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Rapid sign in/out
      await result.current.signInWithOtp("test@example.com");
      await result.current.signOut();
      await result.current.signInWithOtp("test@example.com");

      // Should handle all operations without errors
      expect(mockSupabaseClient.auth.signInWithOtpWithOtp).toHaveBeenCalledTimes(2);
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalledTimes(1);
    });

    it("should handle component unmount during auth operations", async () => {
      mockSupabaseClient.auth.signInWithOtpWithOtp.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      const { result, unmount } = renderHook(() => useAuth());

      await rtlWaitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Start sign in but unmount before completion
      const signInWithOtpPromise = result.current.signInWithOtp("test@example.com");
      unmount();

      // Should not throw errors
      await expect(signInWithOtpPromise).resolves.toBeDefined();
    });
  });

  describe("error resilience", () => {
    it("should recover from temporary network errors", async () => {
      // First call fails, second succeeds
      mockSupabaseClient.auth.signInWithOtpWithOtp
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce({ data: {}, error: null });

      const { result } = renderHook(() => useAuth());

      await rtlWaitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // First attempt fails
      const firstResult = await result.current.signInWithOtp("test@example.com");
      expect(firstResult.success).toBe(false);

      // Second attempt succeeds
      const secondResult = await result.current.signInWithOtp("test@example.com");
      expect(secondResult.success).toBe(true);
    });

    it("should handle malformed responses gracefully", async () => {
      mockSupabaseClient.auth.signInWithOtpWithOtp.mockResolvedValue({
        // Missing data and error properties
      } as any);

      const { result } = renderHook(() => useAuth());

      await rtlWaitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const signInWithOtpResult = await result.current.signInWithOtp("test@example.com");

      // Should handle gracefully and not crash
      expect(signInWithOtpResult).toBeDefined();
    });
  });
});