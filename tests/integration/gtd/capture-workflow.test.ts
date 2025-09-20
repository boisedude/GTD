import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, rtlWaitFor } from "../../utils/test-utils";
import { userInteractions } from "../../utils/test-utils";
import { CaptureInput } from "@/components/capture/CaptureInput";
import { createMockSupabaseClient } from "../../utils/test-utils";
import { mockUsers } from "../../fixtures/data";
import { toast } from "sonner";

// Mock dependencies
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/utils/supabase/client", () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}));

let mockSupabaseClient: ReturnType<typeof createMockSupabaseClient>;

describe("GTD Capture Workflow Integration", () => {
  const mockUser = mockUsers[0];

  beforeEach(() => {
    mockSupabaseClient = createMockSupabaseClient();
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("task capture flow", () => {
    const mockOnTaskCapture = vi.fn().mockImplementation(async (title: string) => {
      // Simulate database insert
      const newTask = {
        id: `task-${Date.now()}`,
        user_id: mockUser.id,
        title,
        status: "captured",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        completed_at: null,
        description: null,
        due_date: null,
        priority: null,
        context: null,
        energy_level: null,
        estimated_duration: null,
        waiting_for: null,
        tags: null,
        project_id: null,
      };

      mockSupabaseClient.from().insert.mockResolvedValueOnce({
        data: [newTask],
        error: null,
      });

      return newTask;
    });

    it("should complete full capture workflow with immediate save", async () => {
      render(React.createElement(CaptureInput, { onTaskCapture: mockOnTaskCapture }));

      const input = screen.getByPlaceholderText("What's on your mind?");
      const addButton = screen.getByRole("button", { name: /add task/i });

      // Type task title
      await userInteractions.type(input, "Buy groceries");

      // Verify button becomes enabled
      expect(addButton).not.toBeDisabled();

      // Submit task
      await userInteractions.click(addButton);

      // Verify capture function was called
      expect(mockOnTaskCapture).toHaveBeenCalledWith("Buy groceries");

      // Verify success feedback
      await rtlWaitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("Task captured successfully!");
      });

      // Verify input is cleared
      expect(input).toHaveValue("");
    });

    it("should complete full capture workflow with auto-save", async () => {
      render(React.createElement(CaptureInput, { onTaskCapture: mockOnTaskCapture }));

      const input = screen.getByPlaceholderText("What's on your mind?");

      // Type task title
      await userInteractions.type(input, "Call dentist");

      // Wait for auto-save delay
      vi.advanceTimersByTime(2000);

      // Verify capture function was called
      await rtlWaitFor(() => {
        expect(mockOnTaskCapture).toHaveBeenCalledWith("Call dentist");
      });

      // Verify success feedback
      await rtlWaitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("Task captured successfully!");
      });

      // Verify input is cleared
      expect(input).toHaveValue("");
    });

    it("should handle database errors during capture", async () => {
      const failingCapture = vi.fn().mockRejectedValue(
        new Error("Database connection failed")
      );

      render(React.createElement(CaptureInput, { onTaskCapture: failingCapture }));

      const input = screen.getByPlaceholderText("What's on your mind?");
      const addButton = screen.getByRole("button", { name: /add task/i });

      await userInteractions.type(input, "Task that will fail");
      await userInteractions.click(addButton);

      // Verify error feedback
      await rtlWaitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Database connection failed");
      });

      // Input should retain value on error
      expect(input).toHaveValue("Task that will fail");
    });

    it("should handle network timeout during capture", async () => {
      const timeoutCapture = vi.fn().mockImplementation(
        () => new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Request timeout")), 5000)
        )
      );

      render(React.createElement(CaptureInput, { onTaskCapture: timeoutCapture }));

      const input = screen.getByPlaceholderText("What's on your mind?");
      const addButton = screen.getByRole("button", { name: /add task/i });

      await userInteractions.type(input, "Timeout task");
      await userInteractions.click(addButton);

      // Fast-forward through timeout
      vi.advanceTimersByTime(5000);

      await rtlWaitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Request timeout");
      });
    });

    it("should prevent duplicate captures during loading", async () => {
      const slowCapture = vi.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );

      render(React.createElement(CaptureInput, { onTaskCapture: slowCapture }));

      const input = screen.getByPlaceholderText("What's on your mind?");
      const addButton = screen.getByRole("button", { name: /add task/i });

      await userInteractions.type(input, "Slow task");

      // Click multiple times rapidly
      await userInteractions.click(addButton);
      await userInteractions.click(addButton);
      await userInteractions.click(addButton);

      // Should only be called once
      expect(slowCapture).toHaveBeenCalledTimes(1);
    });

    it("should validate input before capture", async () => {
      render(React.createElement(CaptureInput, { onTaskCapture: mockOnTaskCapture }));

      const addButton = screen.getByRole("button", { name: /add task/i });

      // Button should be disabled for empty input
      expect(addButton).toBeDisabled();

      // Should not capture empty or whitespace-only tasks
      await userInteractions.click(addButton);
      expect(mockOnTaskCapture).not.toHaveBeenCalled();
    });

    it("should trim whitespace from captured tasks", async () => {
      render(React.createElement(CaptureInput, { onTaskCapture: mockOnTaskCapture }));

      const input = screen.getByPlaceholderText("What's on your mind?");
      const addButton = screen.getByRole("button", { name: /add task/i });

      await userInteractions.type(input, "  Trimmed task  ");
      await userInteractions.click(addButton);

      expect(mockOnTaskCapture).toHaveBeenCalledWith("Trimmed task");
    });
  });

  describe("capture with context integration", () => {
    it("should integrate with task highlight context", async () => {
      // Mock task highlight context
      const mockShouldHighlight = vi.fn().mockReturnValue(false);

      render(
        React.createElement(CaptureInput, { onTaskCapture: mockOnTaskCapture }),
        {
          contextOverrides: {
            taskHighlight: {
              shouldHighlight: mockShouldHighlight,
              highlightTasks: vi.fn(),
            },
          },
        }
      );

      const input = screen.getByPlaceholderText("What's on your mind?");
      await userInteractions.type(input, "Context integrated task");

      // Fast-forward auto-save
      vi.advanceTimersByTime(2000);

      await rtlWaitFor(() => {
        expect(mockOnTaskCapture).toHaveBeenCalledWith("Context integrated task");
      });
    });

    it("should integrate with offline actions", async () => {
      // Mock offline scenario
      const offlineCapture = vi.fn().mockImplementation(async (title: string) => {
        // Simulate offline storage
        const offlineTask = {
          id: `offline-${Date.now()}`,
          title,
          status: "captured",
          created_at: new Date().toISOString(),
          offline: true,
        };

        return offlineTask;
      });

      render(React.createElement(CaptureInput, { onTaskCapture: offlineCapture }));

      const input = screen.getByPlaceholderText("What's on your mind?");
      const addButton = screen.getByRole("button", { name: /add task/i });

      await userInteractions.type(input, "Offline task");
      await userInteractions.click(addButton);

      expect(offlineCapture).toHaveBeenCalledWith("Offline task");
    });
  });

  describe("capture performance", () => {
    it("should complete capture within performance target", async () => {
      const startTime = performance.now();

      render(React.createElement(CaptureInput, { onTaskCapture: mockOnTaskCapture }));

      const input = screen.getByPlaceholderText("What's on your mind?");
      const addButton = screen.getByRole("button", { name: /add task/i });

      await userInteractions.type(input, "Performance test task");
      await userInteractions.click(addButton);

      await rtlWaitFor(() => {
        expect(mockOnTaskCapture).toHaveBeenCalled();
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete within 5 seconds (as per requirements)
      expect(duration).toBeLessThan(5000);
    });

    it("should handle rapid successive captures", async () => {
      render(React.createElement(CaptureInput, { onTaskCapture: mockOnTaskCapture }));

      const input = screen.getByPlaceholderText("What's on your mind?");

      // Rapidly capture multiple tasks
      for (let i = 1; i <= 5; i++) {
        await userInteractions.type(input, `Task ${i}`);
        await userInteractions.keyboard("{Enter}");

        await rtlWaitFor(() => {
          expect(input).toHaveValue("");
        });
      }

      expect(mockOnTaskCapture).toHaveBeenCalledTimes(5);
      expect(mockOnTaskCapture).toHaveBeenNthCalledWith(1, "Task 1");
      expect(mockOnTaskCapture).toHaveBeenNthCalledWith(5, "Task 5");
    });
  });

  describe("capture accessibility", () => {
    it("should provide proper feedback for screen readers", async () => {
      render(React.createElement(CaptureInput, { onTaskCapture: mockOnTaskCapture }));

      const input = screen.getByPlaceholderText("What's on your mind?");
      const addButton = screen.getByRole("button", { name: /add task/i });

      // Check accessibility attributes
      expect(addButton).toHaveAttribute("type", "submit");
      expect(screen.getByText("Add task")).toHaveClass("sr-only");

      await userInteractions.type(input, "Accessible task");
      await userInteractions.click(addButton);

      // Success feedback should be announced via toast
      await rtlWaitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("Task captured successfully!");
      });
    });

    it("should support keyboard navigation", async () => {
      render(React.createElement(CaptureInput, { onTaskCapture: mockOnTaskCapture }));

      const input = screen.getByPlaceholderText("What's on your mind?");

      // Type task
      await userInteractions.type(input, "Keyboard task");

      // Submit with Enter key
      await userInteractions.keyboard("{Enter}");

      expect(mockOnTaskCapture).toHaveBeenCalledWith("Keyboard task");
    });

    it("should clear with Escape key", async () => {
      render(React.createElement(CaptureInput, { onTaskCapture: mockOnTaskCapture }));

      const input = screen.getByPlaceholderText("What's on your mind?");

      await userInteractions.type(input, "Task to clear");
      expect(input).toHaveValue("Task to clear");

      await userInteractions.keyboard("{Escape}");
      expect(input).toHaveValue("");
    });
  });

  describe("mobile capture workflow", () => {
    it("should handle touch interactions properly", async () => {
      // Mock mobile viewport
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(React.createElement(CaptureInput, { onTaskCapture: mockOnTaskCapture }));

      const input = screen.getByPlaceholderText("What's on your mind?");
      const addButton = screen.getByRole("button", { name: /add task/i });

      // Verify mobile-optimized classes
      expect(input).toHaveClass("text-[16px]"); // Prevents iOS zoom
      expect(addButton).toHaveClass("min-h-[44px]", "min-w-[44px]"); // Touch target

      await userInteractions.type(input, "Mobile task");
      await userInteractions.click(addButton);

      expect(mockOnTaskCapture).toHaveBeenCalledWith("Mobile task");
    });

    it("should focus back to input after capture on mobile", async () => {
      render(React.createElement(CaptureInput, { onTaskCapture: mockOnTaskCapture }));

      const input = screen.getByPlaceholderText("What's on your mind?");
      const addButton = screen.getByRole("button", { name: /add task/i });

      await userInteractions.type(input, "Focus test task");
      await userInteractions.click(addButton);

      await rtlWaitFor(() => {
        expect(input).toHaveValue("");
      });

      // Focus should return to input (with timeout for UX)
      vi.advanceTimersByTime(100);
      expect(input).toHaveFocus();
    });
  });

  describe("capture error recovery", () => {
    it("should retain input value on error for user recovery", async () => {
      const failingCapture = vi.fn().mockRejectedValue(
        new Error("Network error")
      );

      render(React.createElement(CaptureInput, { onTaskCapture: failingCapture }));

      const input = screen.getByPlaceholderText("What's on your mind?");
      const addButton = screen.getByRole("button", { name: /add task/i });

      await userInteractions.type(input, "Important task");
      await userInteractions.click(addButton);

      await rtlWaitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Network error");
      });

      // Input should retain value for user to retry
      expect(input).toHaveValue("Important task");
      expect(addButton).not.toBeDisabled();
    });

    it("should allow retry after error", async () => {
      const flakyCapture = vi.fn()
        .mockRejectedValueOnce(new Error("Temporary error"))
        .mockResolvedValueOnce(undefined);

      render(React.createElement(CaptureInput, { onTaskCapture: flakyCapture }));

      const input = screen.getByPlaceholderText("What's on your mind?");
      const addButton = screen.getByRole("button", { name: /add task/i });

      await userInteractions.type(input, "Retry task");
      await userInteractions.click(addButton);

      // First attempt fails
      await rtlWaitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Temporary error");
      });

      // Retry should work
      await userInteractions.click(addButton);

      await rtlWaitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("Task captured successfully!");
      });

      expect(flakyCapture).toHaveBeenCalledTimes(2);
    });
  });

  describe("capture data persistence", () => {
    it("should persist captured tasks to database", async () => {
      const capturedTasks: any[] = [];

      const persistingCapture = vi.fn().mockImplementation(async (title: string) => {
        const task = {
          id: `task-${Date.now()}`,
          user_id: mockUser.id,
          title,
          status: "captured",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        capturedTasks.push(task);
        return task;
      });

      render(React.createElement(CaptureInput, { onTaskCapture: persistingCapture }));

      const input = screen.getByPlaceholderText("What's on your mind?");

      // Capture multiple tasks
      const taskTitles = ["Task 1", "Task 2", "Task 3"];

      for (const title of taskTitles) {
        await userInteractions.type(input, title);
        await userInteractions.keyboard("{Enter}");

        await rtlWaitFor(() => {
          expect(input).toHaveValue("");
        });
      }

      expect(capturedTasks).toHaveLength(3);
      expect(capturedTasks.map(task => task.title)).toEqual(taskTitles);
      expect(capturedTasks.every(task => task.status === "captured")).toBe(true);
    });
  });
});