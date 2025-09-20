import React, { ReactElement } from "react";
import { render, RenderOptions, act } from "@testing-library/react";
import { vi } from "vitest";
import { AuthProvider } from "@/contexts/auth-context";
import { TaskHighlightProvider } from "@/contexts/task-highlight-context";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "sonner";
import { mockUsers } from "../fixtures/data";

// Mock the useAuth hook directly to avoid Supabase complexity in component tests
vi.mock("@/contexts/auth-context", async () => {
  const actual = await vi.importActual("@/contexts/auth-context");
  return {
    ...actual,
    useAuth: vi.fn(() => ({
      user: mockUsers[0],
      session: { user: mockUsers[0] },
      loading: false,
      signInWithOtp: vi.fn().mockResolvedValue({ error: null }),
      verifyOtp: vi.fn().mockResolvedValue({ error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      isNewUser: false,
      setIsNewUser: vi.fn(),
    })),
  };
});

// Mock the Supabase client module for integration tests
vi.mock("@/utils/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { user: mockUsers[0] } },
        error: null,
      }),
      getUser: vi.fn().mockResolvedValue({
        data: { user: mockUsers[0] },
        error: null,
      }),
      signInWithOtp: vi.fn().mockResolvedValue({ data: {}, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      verifyOtp: vi.fn().mockResolvedValue({ data: {}, error: null }),
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
  }),
}));

// Create a simpler mock AuthContext provider that doesn't use Supabase
const MockAuthProvider: React.FC<{
  children: React.ReactNode;
  user?: (typeof mockUsers)[0];
}> = ({ children, user = mockUsers[0] }) => {
  const mockAuthValue = {
    user,
    session: user ? { user } : null,
    loading: false,
    signInWithOtp: vi.fn().mockResolvedValue({ error: null }),
    verifyOtp: vi.fn().mockResolvedValue({ error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    isNewUser: false,
    setIsNewUser: vi.fn(),
  };

  // Use React.createContext to create a temporary context for testing
  const TestAuthContext = React.createContext(mockAuthValue);

  return (
    <TestAuthContext.Provider value={mockAuthValue}>
      {children}
    </TestAuthContext.Provider>
  );
};

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  user?: (typeof mockUsers)[0];
  withAuth?: boolean;
  withToasts?: boolean;
  withSidebar?: boolean;
  contextOverrides?: {
    taskHighlight?: {
      shouldHighlight: (task: any) => boolean;
      highlightTasks: (tasks: any[]) => void;
    };
  };
}

// Custom render function that includes providers
const customRender = (
  ui: ReactElement,
  {
    user = mockUsers[0],
    withAuth = true,
    withToasts = false,
    withSidebar = false,
    contextOverrides,
    ...renderOptions
  }: CustomRenderOptions = {}
) => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    let content = children;

    // Wrap with context providers in the correct order
    if (withAuth) {
      content = <MockAuthProvider user={user}>{content}</MockAuthProvider>;
    }

    if (contextOverrides?.taskHighlight) {
      const MockTaskHighlightProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <TaskHighlightProvider>
          {children}
        </TaskHighlightProvider>
      );
      content = <MockTaskHighlightProvider>{content}</MockTaskHighlightProvider>;
    }

    if (withSidebar) {
      content = <SidebarProvider>{content}</SidebarProvider>;
    }

    if (withToasts) {
      content = (
        <>
          {content}
          <Toaster />
        </>
      );
    }

    return <>{content}</>;
  };

  // Wrap the render call in act() to prevent warnings
  let result;
  act(() => {
    result = render(ui, { wrapper: Wrapper, ...renderOptions });
  });
  return result!;
};

// Wait for a condition to be met
export const waitFor = async (
  callback: () => boolean | Promise<boolean>,
  options: { timeout?: number; interval?: number } = {}
) => {
  const { timeout = 5000, interval = 50 } = options;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      if (await callback()) {
        return;
      }
    } catch (error) {
      // Ignore errors during waiting, will throw at the end if timeout
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error(`Condition not met within ${timeout}ms`);
};

// Re-export React Testing Library's waitFor for convenience
export { waitFor as rtlWaitFor } from "@testing-library/react";

// Create a mock Supabase client
export const createMockSupabaseClient = (
  overrides: Record<string, unknown> = {}
) => {
  const defaultClient = {
    auth: {
      getUser: vi
        .fn()
        .mockResolvedValue({ data: { user: mockUsers[0] }, error: null }),
      getSession: vi.fn().mockResolvedValue({
        data: { session: { user: mockUsers[0] } },
        error: null,
      }),
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
  };

  return { ...defaultClient, ...overrides };
};

// Mock implementation for localStorage
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach((key) => delete store[key]);
    }),
  };
};

// Create a mock timer for testing time-dependent functionality
export const createMockTimer = () => {
  let currentTime = 0;

  return {
    getCurrentTime: () => currentTime,
    advance: (ms: number) => {
      currentTime += ms;
      vi.advanceTimersByTime(ms);
    },
    reset: () => {
      currentTime = 0;
      vi.clearAllTimers();
    },
  };
};

// Mock fetch responses
export const mockFetch = (response: unknown, status = 200) => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(response),
    text: vi.fn().mockResolvedValue(JSON.stringify(response)),
  });
};

// Helper to simulate user interactions - optimized for fake timers
export const userInteractions = {
  type: async (element: HTMLElement, text: string) => {
    const { fireEvent } = await import("@testing-library/react");
    await act(async () => {
      // Focus the element first
      element.focus();
      fireEvent.focus(element);

      // Set the final value directly - simpler and more reliable
      const currentValue = (element as HTMLInputElement).value || "";
      const newValue = currentValue + text;

      fireEvent.change(element, { target: { value: newValue } });
      fireEvent.input(element, { target: { value: newValue } });
    });
  },
  click: async (element: HTMLElement) => {
    const { fireEvent } = await import("@testing-library/react");
    await act(async () => {
      fireEvent.click(element);
    });
  },
  select: async (element: HTMLElement, option: string) => {
    const { fireEvent } = await import("@testing-library/react");
    await act(async () => {
      fireEvent.change(element, { target: { value: option } });
    });
  },
  keyboard: async (keys: string) => {
    const { fireEvent } = await import("@testing-library/react");
    const focusedElement = document.activeElement;
    if (!focusedElement) return;

    await act(async () => {
      // Parse simple key combinations
      if (keys === "{Enter}") {
        fireEvent.keyDown(focusedElement, { key: "Enter", code: "Enter" });
        fireEvent.keyUp(focusedElement, { key: "Enter", code: "Enter" });
      } else if (keys === "{Escape}") {
        fireEvent.keyDown(focusedElement, { key: "Escape", code: "Escape" });
        fireEvent.keyUp(focusedElement, { key: "Escape", code: "Escape" });
      } else if (keys === "{Shift>}{Tab}{/Shift}") {
        fireEvent.keyDown(focusedElement, { key: "Tab", code: "Tab", shiftKey: true });
        fireEvent.keyUp(focusedElement, { key: "Tab", code: "Tab", shiftKey: true });
      } else {
        // Handle regular text
        for (const char of keys) {
          fireEvent.keyDown(focusedElement, { key: char, code: `Key${char.toUpperCase()}` });
          fireEvent.keyUp(focusedElement, { key: char, code: `Key${char.toUpperCase()}` });
        }
      }
    });
  },
  hover: async (element: HTMLElement) => {
    const { fireEvent } = await import("@testing-library/react");
    await act(async () => {
      fireEvent.mouseEnter(element);
      fireEvent.mouseOver(element);
    });
  },
  tab: async (shift = false) => {
    const { fireEvent } = await import("@testing-library/react");
    const focusedElement = document.activeElement;
    if (!focusedElement) return;

    await act(async () => {
      fireEvent.keyDown(focusedElement, { key: "Tab", code: "Tab", shiftKey: shift });
      fireEvent.keyUp(focusedElement, { key: "Tab", code: "Tab", shiftKey: shift });
    });
  },
  dragAndDrop: async (source: HTMLElement, target: HTMLElement) => {
    const { fireEvent } = await import("@testing-library/react");
    await act(async () => {
      fireEvent.dragStart(source);
      fireEvent.dragEnter(target);
      fireEvent.drop(target);
      fireEvent.dragEnd(source);
    });
  },
};

// Test data generators
export const testData = {
  randomString: (length = 10) =>
    Math.random()
      .toString(36)
      .substring(2, length + 2),
  randomEmail: () => `test.${testData.randomString(5)}@example.com`,
  randomDate: () =>
    new Date(
      Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30
    ).toISOString(),
};

// Performance testing helpers
export const performanceHelpers = {
  measureRenderTime: async (renderFn: () => void) => {
    const start = performance.now();
    renderFn();
    const end = performance.now();
    return end - start;
  },
  measureAsyncOperation: async (asyncFn: () => Promise<void>) => {
    const start = performance.now();
    await asyncFn();
    const end = performance.now();
    return end - start;
  },
};

// Mobile testing utilities
export const mobileHelpers = {
  setMobileViewport: (page?: any) => {
    if (page) {
      // For Playwright tests
      return page.setViewportSize({ width: 375, height: 667 });
    } else {
      // For unit tests
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 375,
      });
      Object.defineProperty(window, "innerHeight", {
        writable: true,
        configurable: true,
        value: 667,
      });
      window.dispatchEvent(new Event("resize"));
    }
  },
  setDesktopViewport: (page?: any) => {
    if (page) {
      // For Playwright tests
      return page.setViewportSize({ width: 1024, height: 768 });
    } else {
      // For unit tests
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1024,
      });
      Object.defineProperty(window, "innerHeight", {
        writable: true,
        configurable: true,
        value: 768,
      });
      window.dispatchEvent(new Event("resize"));
    }
  },
  simulateTouchEvent: (element: HTMLElement, type: "touchstart" | "touchend" | "touchmove") => {
    const touchEvent = new TouchEvent(type, {
      bubbles: true,
      cancelable: true,
      touches: [{
        identifier: 0,
        target: element,
        clientX: 100,
        clientY: 100,
        pageX: 100,
        pageY: 100,
        screenX: 100,
        screenY: 100,
        radiusX: 10,
        radiusY: 10,
        rotationAngle: 0,
        force: 1,
      }] as any,
    });
    element.dispatchEvent(touchEvent);
  },
};

// Toast testing utilities
export const toastHelpers = {
  waitForToast: async (text: string, timeout = 5000) => {
    const { waitFor, screen } = await import("@testing-library/react");
    return waitFor(() => {
      const toast = screen.getByText(text);
      expect(toast).toBeInTheDocument();
      return toast;
    }, { timeout });
  },
  expectToastToExist: async (text: string) => {
    const { screen } = await import("@testing-library/react");
    expect(screen.getByText(text)).toBeInTheDocument();
  },
  expectToastNotToExist: async (text: string) => {
    const { screen } = await import("@testing-library/react");
    expect(screen.queryByText(text)).not.toBeInTheDocument();
  },
};

// Accessibility testing utilities
export const a11yHelpers = {
  checkFocusVisible: async (element: HTMLElement) => {
    const styles = window.getComputedStyle(element);
    const hasFocusRing =
      styles.outline !== "none" ||
      styles.outlineWidth !== "0px" ||
      styles.boxShadow.includes("inset") ||
      styles.boxShadow.includes("focus");

    expect(hasFocusRing).toBe(true);
  },
  checkTouchTargetSize: async (element: HTMLElement, minSize = 44) => {
    const rect = element.getBoundingClientRect();
    expect(rect.width).toBeGreaterThanOrEqual(minSize);
    expect(rect.height).toBeGreaterThanOrEqual(minSize);
  },
  checkAriaLabel: (element: HTMLElement) => {
    const ariaLabel = element.getAttribute("aria-label");
    const ariaLabelledBy = element.getAttribute("aria-labelledby");
    const textContent = element.textContent?.trim();

    expect(ariaLabel || ariaLabelledBy || textContent).toBeTruthy();
  },
  checkKeyboardNavigation: async (startElement: HTMLElement, expectedElements: string[]) => {
    const { userEvent } = await import("@testing-library/user-event");
    const user = userEvent.setup();

    startElement.focus();

    for (const expectedText of expectedElements) {
      await user.tab();
      const focused = document.activeElement;
      expect(focused?.textContent).toContain(expectedText);
    }
  },
};

// GTD workflow testing utilities
export const gtdHelpers = {
  createMockTask: (overrides = {}) => ({
    id: `task-${Date.now()}`,
    user_id: "test-user-1",
    title: "Test Task",
    description: "Test Description",
    status: "captured",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    completed_at: null,
    due_date: null,
    priority: null,
    context: null,
    energy_level: null,
    estimated_duration: null,
    waiting_for: null,
    tags: null,
    project_id: null,
    ...overrides,
  }),
  createMockProject: (overrides = {}) => ({
    id: `project-${Date.now()}`,
    user_id: "test-user-1",
    name: "Test Project",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }),
  simulateTaskStatusFlow: async (
    taskElement: HTMLElement,
    targetStatus: "next_action" | "waiting_for" | "someday" | "project" | "completed"
  ) => {
    await userInteractions.hover(taskElement);
    await userInteractions.click(taskElement.querySelector('[aria-label*="more"]') as HTMLElement);

    const statusMap = {
      next_action: "Move to Next Actions",
      waiting_for: "Move to Waiting For",
      someday: "Move to Someday/Maybe",
      project: "Convert to Project",
      completed: "Mark Complete",
    };

    const { screen } = await import("@testing-library/react");
    await userInteractions.click(screen.getByText(statusMap[targetStatus]));
  },
};

// Form testing utilities
export const formHelpers = {
  fillForm: async (formData: Record<string, string>) => {
    const { screen } = await import("@testing-library/react");

    for (const [fieldName, value] of Object.entries(formData)) {
      const field = screen.getByLabelText(new RegExp(fieldName, 'i'));
      await userInteractions.type(field, value);
    }
  },
  submitForm: async (submitButtonText = /submit|save|create/i) => {
    const { screen } = await import("@testing-library/react");
    const submitButton = screen.getByRole("button", { name: submitButtonText });
    await userInteractions.click(submitButton);
  },
  expectFormValidation: async (fieldName: string, errorMessage: string) => {
    const { screen } = await import("@testing-library/react");
    const field = screen.getByLabelText(new RegExp(fieldName, 'i'));
    const isInvalid = field.getAttribute("aria-invalid") === "true";
    const errorText = screen.queryByText(errorMessage);

    expect(isInvalid || errorText).toBeTruthy();
  },
};

// Component-specific testing utilities
export const componentHelpers = {
  sidebar: {
    expectCollapsed: async () => {
      // Implementation depends on sidebar implementation
      const sidebar = document.querySelector('[data-testid="sidebar"]');
      expect(sidebar).toHaveClass("collapsed");
    },
    expectExpanded: async () => {
      const sidebar = document.querySelector('[data-testid="sidebar"]');
      expect(sidebar).not.toHaveClass("collapsed");
    },
    toggle: async () => {
      const { screen } = await import("@testing-library/react");
      const toggleButton = screen.getByRole("button", { name: /toggle sidebar/i });
      await userInteractions.click(toggleButton);
    },
  },
  drawer: {
    expectOpen: async () => {
      const { screen } = await import("@testing-library/react");
      expect(screen.getByRole("dialog")).toBeVisible();
    },
    expectClosed: async () => {
      const { screen } = await import("@testing-library/react");
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    },
    open: async () => {
      const { screen } = await import("@testing-library/react");
      const trigger = screen.getByRole("button", { name: /menu/i });
      await userInteractions.click(trigger);
    },
    close: async () => {
      await userInteractions.keyboard("{Escape}");
    },
  },
  confirmDialog: {
    expectOpen: async (title: string) => {
      const { screen } = await import("@testing-library/react");
      expect(screen.getByRole("alertdialog")).toBeVisible();
      expect(screen.getByText(title)).toBeVisible();
    },
    confirm: async () => {
      const { screen } = await import("@testing-library/react");
      const confirmButton = screen.getByRole("button", { name: /confirm|delete|ok/i });
      await userInteractions.click(confirmButton);
    },
    cancel: async () => {
      const { screen } = await import("@testing-library/react");
      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      await userInteractions.click(cancelButton);
    },
  },
};

// Custom renderHook function that includes providers
const customRenderHook = <T extends any[], R>(
  callback: (...args: T) => R,
  options: CustomRenderOptions = {}
) => {
  const {
    user = mockUsers[0],
    withAuth = true,
    withToasts = false,
    withSidebar = false,
    contextOverrides,
    ...renderOptions
  } = options;

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    let content = children;

    // Wrap with context providers in the correct order
    if (withAuth) {
      content = <MockAuthProvider user={user}>{content}</MockAuthProvider>;
    }

    if (contextOverrides?.taskHighlight) {
      const MockTaskHighlightProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <TaskHighlightProvider>
          {children}
        </TaskHighlightProvider>
      );
      content = <MockTaskHighlightProvider>{content}</MockTaskHighlightProvider>;
    }

    if (withSidebar) {
      content = <SidebarProvider>{content}</SidebarProvider>;
    }

    if (withToasts) {
      content = (
        <>
          {content}
          <Toaster />
        </>
      );
    }

    return <>{content}</>;
  };

  // Import renderHook from testing library
  const { renderHook } = require("@testing-library/react");

  // Wrap the renderHook call in act() to prevent warnings
  let result;
  act(() => {
    result = renderHook(callback, { wrapper: Wrapper, ...renderOptions });
  });
  return result!;
};

// Export everything including the custom render
export * from "@testing-library/react";
export { customRender as render };
export { customRenderHook as renderHook };
export { vi as jest }; // For compatibility with existing test patterns
