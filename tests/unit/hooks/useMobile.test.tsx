import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "../../utils/test-utils";
import { useIsMobile } from "@/hooks/use-mobile";

// Mock window.matchMedia
const mockMatchMedia = vi.fn();

describe("useIsMobile", () => {
  let mockListener: ((event: MediaQueryListEvent) => void) | null = null;
  let mockMediaQueryList: MediaQueryList;

  beforeEach(() => {
    mockListener = null;

    mockMediaQueryList = {
      matches: false,
      media: "(max-width: 767px)",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn((type, listener) => {
        if (type === "change") {
          mockListener = listener as (event: MediaQueryListEvent) => void;
        }
      }),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };

    mockMatchMedia.mockReturnValue(mockMediaQueryList);
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: mockMatchMedia,
    });

    // Mock window.innerWidth
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("initialization", () => {
    it("should return false initially for undefined state", () => {
      const { result } = renderHook(() => useIsMobile());

      // Should return false for undefined state (!! converts undefined to false)
      expect(result.current).toBe(false);
    });

    it("should register media query listener on mount", () => {
      renderHook(() => useIsMobile());

      expect(mockMatchMedia).toHaveBeenCalledWith("(max-width: 767px)");
      expect(mockMediaQueryList.addEventListener).toHaveBeenCalledWith(
        "change",
        expect.any(Function)
      );
    });

    it("should set initial state based on window.innerWidth", () => {
      // Set mobile viewport
      Object.defineProperty(window, "innerWidth", {
        value: 375,
        configurable: true,
      });

      const { result } = renderHook(() => useIsMobile());

      // Should be true for mobile viewport
      expect(result.current).toBe(true);
    });

    it("should set initial state based on desktop viewport", () => {
      // Set desktop viewport
      Object.defineProperty(window, "innerWidth", {
        value: 1024,
        configurable: true,
      });

      const { result } = renderHook(() => useIsMobile());

      // Should be false for desktop viewport
      expect(result.current).toBe(false);
    });
  });

  describe("breakpoint detection", () => {
    it("should use 768px as the mobile breakpoint", () => {
      renderHook(() => useIsMobile());

      expect(mockMatchMedia).toHaveBeenCalledWith("(max-width: 767px)");
    });

    it("should detect mobile when width is exactly 767px", () => {
      Object.defineProperty(window, "innerWidth", {
        value: 767,
        configurable: true,
      });

      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(true);
    });

    it("should detect desktop when width is exactly 768px", () => {
      Object.defineProperty(window, "innerWidth", {
        value: 768,
        configurable: true,
      });

      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(false);
    });

    it("should detect mobile for common mobile widths", () => {
      const mobileWidths = [320, 375, 414, 480, 640, 767];

      mobileWidths.forEach((width) => {
        Object.defineProperty(window, "innerWidth", {
          value: width,
          configurable: true,
        });

        const { result } = renderHook(() => useIsMobile());
        expect(result.current).toBe(true);
      });
    });

    it("should detect desktop for common desktop widths", () => {
      const desktopWidths = [768, 1024, 1280, 1440, 1920];

      desktopWidths.forEach((width) => {
        Object.defineProperty(window, "innerWidth", {
          value: width,
          configurable: true,
        });

        const { result } = renderHook(() => useIsMobile());
        expect(result.current).toBe(false);
      });
    });
  });

  describe("media query change events", () => {
    it("should update state when media query changes to mobile", () => {
      // Start with desktop
      Object.defineProperty(window, "innerWidth", {
        value: 1024,
        configurable: true,
      });

      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(false);

      // Simulate window resize to mobile
      act(() => {
        Object.defineProperty(window, "innerWidth", {
          value: 375,
          configurable: true,
        });

        if (mockListener) {
          mockListener({
            matches: true,
            media: "(max-width: 767px)",
          } as MediaQueryListEvent);
        }
      });

      expect(result.current).toBe(true);
    });

    it("should update state when media query changes to desktop", () => {
      // Start with mobile
      Object.defineProperty(window, "innerWidth", {
        value: 375,
        configurable: true,
      });

      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(true);

      // Simulate window resize to desktop
      act(() => {
        Object.defineProperty(window, "innerWidth", {
          value: 1024,
          configurable: true,
        });

        if (mockListener) {
          mockListener({
            matches: false,
            media: "(max-width: 767px)",
          } as MediaQueryListEvent);
        }
      });

      expect(result.current).toBe(false);
    });

    it("should handle multiple state changes", () => {
      const { result } = renderHook(() => useIsMobile());

      // Mobile
      act(() => {
        Object.defineProperty(window, "innerWidth", {
          value: 375,
          configurable: true,
        });

        if (mockListener) {
          mockListener({
            matches: true,
            media: "(max-width: 767px)",
          } as MediaQueryListEvent);
        }
      });
      expect(result.current).toBe(true);

      // Desktop
      act(() => {
        Object.defineProperty(window, "innerWidth", {
          value: 1024,
          configurable: true,
        });

        if (mockListener) {
          mockListener({
            matches: false,
            media: "(max-width: 767px)",
          } as MediaQueryListEvent);
        }
      });
      expect(result.current).toBe(false);

      // Mobile again
      act(() => {
        Object.defineProperty(window, "innerWidth", {
          value: 480,
          configurable: true,
        });

        if (mockListener) {
          mockListener({
            matches: true,
            media: "(max-width: 767px)",
          } as MediaQueryListEvent);
        }
      });
      expect(result.current).toBe(true);
    });
  });

  describe("cleanup", () => {
    it("should remove event listener on unmount", () => {
      const { unmount } = renderHook(() => useIsMobile());

      unmount();

      expect(mockMediaQueryList.removeEventListener).toHaveBeenCalledWith(
        "change",
        expect.any(Function)
      );
    });

    it("should not cause memory leaks on multiple mounts/unmounts", () => {
      // Mount and unmount multiple times
      for (let i = 0; i < 5; i++) {
        const { unmount } = renderHook(() => useIsMobile());
        unmount();
      }

      // Should have called removeEventListener for each mount
      expect(mockMediaQueryList.removeEventListener).toHaveBeenCalledTimes(5);
    });
  });

  describe("edge cases", () => {
    it("should handle matchMedia not being available", () => {
      // Mock matchMedia as undefined
      Object.defineProperty(window, "matchMedia", {
        value: undefined,
        configurable: true,
      });

      expect(() => {
        renderHook(() => useIsMobile());
      }).toThrow();
    });

    it("should handle window resize events", () => {
      const { result } = renderHook(() => useIsMobile());

      // Simulate window resize by triggering the listener directly
      act(() => {
        Object.defineProperty(window, "innerWidth", {
          value: 600,
          configurable: true,
        });

        // Manually trigger the change event
        if (mockListener) {
          mockListener({
            matches: true,
            media: "(max-width: 767px)",
          } as MediaQueryListEvent);
        }
      });

      expect(result.current).toBe(true);
    });

    it("should handle rapid state changes", () => {
      const { result } = renderHook(() => useIsMobile());

      // Rapidly change between mobile and desktop
      act(() => {
        for (let i = 0; i < 10; i++) {
          const isMobile = i % 2 === 0;
          Object.defineProperty(window, "innerWidth", {
            value: isMobile ? 375 : 1024,
            configurable: true,
          });

          if (mockListener) {
            mockListener({
              matches: isMobile,
              media: "(max-width: 767px)",
            } as MediaQueryListEvent);
          }
        }
      });

      // Should end up in desktop state (even number of changes, starting from desktop)
      expect(result.current).toBe(false);
    });
  });

  describe("SSR considerations", () => {
    it("should handle initial undefined state gracefully", () => {
      // Mock initial render without window
      const originalWindow = global.window;
      delete (global as any).window;

      expect(() => {
        renderHook(() => useIsMobile());
      }).toThrow();

      // Restore window
      global.window = originalWindow;
    });
  });

  describe("boolean conversion", () => {
    it("should always return a boolean value", () => {
      const { result, rerender } = renderHook(() => useIsMobile());

      expect(typeof result.current).toBe("boolean");

      // Change state and verify still boolean
      act(() => {
        Object.defineProperty(window, "innerWidth", {
          value: 375,
          configurable: true,
        });

        if (mockListener) {
          mockListener({
            matches: true,
            media: "(max-width: 767px)",
          } as MediaQueryListEvent);
        }
      });

      rerender();
      expect(typeof result.current).toBe("boolean");
    });

    it("should convert undefined to false using double negation", () => {
      // The hook uses !!isMobile which converts undefined to false
      const { result } = renderHook(() => useIsMobile());

      // Initial state should be false (converted from undefined)
      expect(result.current).toBe(false);
    });
  });

  describe("performance", () => {
    it("should not create new listeners on re-renders", () => {
      const { rerender } = renderHook(() => useIsMobile());

      rerender();
      rerender();
      rerender();

      // Should only add listener once
      expect(mockMediaQueryList.addEventListener).toHaveBeenCalledTimes(1);
    });

    it("should use the same effect dependency array", () => {
      const { rerender } = renderHook(() => useIsMobile());

      // Multiple re-renders shouldn't cause effect to re-run
      rerender();
      rerender();

      // Listener should only be added once
      expect(mockMediaQueryList.addEventListener).toHaveBeenCalledTimes(1);
    });
  });
});