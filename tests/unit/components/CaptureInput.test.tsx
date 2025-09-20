import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, rtlWaitFor, act } from "../../utils/test-utils";
import { userInteractions } from "../../utils/test-utils";
import { CaptureInput } from "@/components/capture/CaptureInput";
import { toast } from "sonner";

// Mock toast notifications
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("CaptureInput", () => {
  let mockOnTaskCapture: ReturnType<typeof vi.fn>;
  let mockOnDetailedCapture: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnTaskCapture = vi.fn().mockResolvedValue(undefined);
    mockOnDetailedCapture = vi.fn();
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe("basic rendering", () => {
    it("should render with default placeholder", () => {
      render(<CaptureInput />);

      expect(
        screen.getByPlaceholderText("What's on your mind?")
      ).toBeInTheDocument();
    });

    it("should render with custom placeholder", () => {
      render(<CaptureInput placeholder="Enter a task..." />);

      expect(
        screen.getByPlaceholderText("Enter a task...")
      ).toBeInTheDocument();
    });

    it("should render add task button with proper accessibility", () => {
      render(<CaptureInput />);

      const addButton = screen.getByRole("button", { name: /add task/i });
      expect(addButton).toBeInTheDocument();
      expect(addButton).toHaveAttribute("type", "submit");
      expect(screen.getByText("Add task")).toHaveClass("sr-only");
    });

    it("should render details button when onDetailedCapture is provided", () => {
      render(<CaptureInput onDetailedCapture={mockOnDetailedCapture} />);

      expect(
        screen.getByRole("button", { name: /details/i })
      ).toBeInTheDocument();
    });

    it("should not render details button when onDetailedCapture is not provided", () => {
      render(<CaptureInput />);

      expect(
        screen.queryByRole("button", { name: /details/i })
      ).not.toBeInTheDocument();
    });

    it("should auto-focus input when autoFocus is true", () => {
      render(<CaptureInput autoFocus />);

      const input = screen.getByPlaceholderText("What's on your mind?");
      expect(input).toHaveFocus();
    });

    it("should have proper form structure", () => {
      render(<CaptureInput />);

      const form = document.querySelector("form");
      expect(form).toBeInTheDocument();
    });
  });

  describe("user input and validation", () => {
    it("should update input value when user types", async () => {
      render(<CaptureInput />);
      const input = screen.getByPlaceholderText("What's on your mind?");

      await userInteractions.type(input, "Test task");

      expect(input).toHaveValue("Test task");
    });

    it("should enable add button when input has content", async () => {
      render(<CaptureInput />);
      const input = screen.getByPlaceholderText("What's on your mind?");
      const addButton = screen.getByRole("button", { name: /add task/i });

      expect(addButton).toBeDisabled();

      await userInteractions.type(input, "Test task");

      expect(addButton).not.toBeDisabled();
    });

    it("should keep add button disabled for whitespace-only input", async () => {
      render(<CaptureInput />);
      const input = screen.getByPlaceholderText("What's on your mind?");
      const addButton = screen.getByRole("button", { name: /add task/i });

      await userInteractions.type(input, "   ");

      expect(addButton).toBeDisabled();
    });

    it("should respect maxLength attribute", () => {
      render(<CaptureInput />);
      const input = screen.getByPlaceholderText("What's on your mind?");

      expect(input).toHaveAttribute("maxLength", "500");
    });
  });

  describe("immediate save functionality", () => {
    it("should save task when add button is clicked", async () => {
      render(<CaptureInput onTaskCapture={mockOnTaskCapture} />);
      const input = screen.getByPlaceholderText("What's on your mind?");
      const addButton = screen.getByRole("button", { name: /add task/i });

      await userInteractions.type(input, "Test task");
      await userInteractions.click(addButton);

      expect(mockOnTaskCapture).toHaveBeenCalledWith("Test task");
    });

    it("should save task when Enter key is pressed", async () => {
      render(<CaptureInput onTaskCapture={mockOnTaskCapture} />);
      const input = screen.getByPlaceholderText("What's on your mind?");

      await userInteractions.type(input, "Test task");
      await userInteractions.keyboard("{Enter}");

      expect(mockOnTaskCapture).toHaveBeenCalledWith("Test task");
    });

    it("should show saving state during save operation", async () => {
      const slowSave = vi.fn(
        () => new Promise<void>((resolve) => setTimeout(resolve, 100))
      );
      render(<CaptureInput onTaskCapture={slowSave} />);
      const input = screen.getByPlaceholderText("What's on your mind?");
      const addButton = screen.getByRole("button", { name: /add task/i });

      await userInteractions.type(input, "Test task");
      await userInteractions.click(addButton);

      // Check for loading spinner
      const spinner = addButton.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
      expect(addButton).toBeDisabled();
      expect(input).toBeDisabled();
    });

    it("should clear input and show success toast after successful save", async () => {
      render(<CaptureInput onTaskCapture={mockOnTaskCapture} />);
      const input = screen.getByPlaceholderText("What's on your mind?");
      const addButton = screen.getByRole("button", { name: /add task/i });

      await userInteractions.type(input, "Test task");
      await userInteractions.click(addButton);

      await rtlWaitFor(() => {
        expect(input).toHaveValue("");
        expect(toast.success).toHaveBeenCalledWith("Task captured successfully!");
      });
    });

    it("should show error toast when save fails", async () => {
      const failingSave = vi.fn().mockRejectedValue(new Error("Save failed"));
      render(<CaptureInput onTaskCapture={failingSave} />);
      const input = screen.getByPlaceholderText("What's on your mind?");
      const addButton = screen.getByRole("button", { name: /add task/i });

      await userInteractions.type(input, "Test task");
      await userInteractions.click(addButton);

      // Wait for async operation to complete
      await act(async () => {
        await Promise.resolve(); // Let promises settle
      });

      expect(toast.error).toHaveBeenCalledWith("Save failed");
    });

    it("should trim whitespace from input before saving", async () => {
      render(<CaptureInput onTaskCapture={mockOnTaskCapture} />);
      const input = screen.getByPlaceholderText("What's on your mind?");
      const addButton = screen.getByRole("button", { name: /add task/i });

      await userInteractions.type(input, "  Test task  ");
      await userInteractions.click(addButton);

      expect(mockOnTaskCapture).toHaveBeenCalledWith("Test task");
    });

    it("should prevent multiple saves during saving state", async () => {
      const slowSave = vi.fn(
        () => new Promise<void>((resolve) => setTimeout(resolve, 100))
      );
      render(<CaptureInput onTaskCapture={slowSave} />);
      const input = screen.getByPlaceholderText("What's on your mind?");
      const addButton = screen.getByRole("button", { name: /add task/i });

      await userInteractions.type(input, "Test task");
      await userInteractions.click(addButton);
      await userInteractions.click(addButton); // Try to click again

      expect(slowSave).toHaveBeenCalledTimes(1);
    });
  });

  describe("auto-save functionality", () => {
    it("should schedule auto-save after typing stops", async () => {
      render(<CaptureInput onTaskCapture={mockOnTaskCapture} />);
      const input = screen.getByPlaceholderText("What's on your mind?");

      await userInteractions.type(input, "Test task");

      // Fast-forward time to trigger auto-save
      await act(async () => {
        vi.advanceTimersByTime(2000);
        await Promise.resolve(); // Let promises settle
      });

      expect(mockOnTaskCapture).toHaveBeenCalledWith("Test task");
    });

    it("should cancel auto-save when input is cleared", async () => {
      render(<CaptureInput onTaskCapture={mockOnTaskCapture} />);
      const input = screen.getByPlaceholderText("What's on your mind?");

      await userInteractions.type(input, "Test task");

      // Clear input before auto-save triggers
      fireEvent.change(input, { target: { value: "" } });

      // Fast-forward time
      await act(async () => {
        vi.advanceTimersByTime(2000);
      });

      expect(mockOnTaskCapture).not.toHaveBeenCalled();
    });

    it("should restart auto-save timer when user continues typing", async () => {
      render(<CaptureInput onTaskCapture={mockOnTaskCapture} />);
      const input = screen.getByPlaceholderText("What's on your mind?");

      await userInteractions.type(input, "Test");

      // Advance part way through the timer
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      // Type more
      await userInteractions.type(input, " task");

      // Advance the remaining original time (should not trigger save)
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
      expect(mockOnTaskCapture).not.toHaveBeenCalled();

      // Advance the new timer duration
      await act(async () => {
        vi.advanceTimersByTime(2000);
        await Promise.resolve(); // Let promises settle
      });

      expect(mockOnTaskCapture).toHaveBeenCalledWith("Test task");
    });

    it("should cancel auto-save when immediate save occurs", async () => {
      render(<CaptureInput onTaskCapture={mockOnTaskCapture} />);
      const input = screen.getByPlaceholderText("What's on your mind?");
      const addButton = screen.getByRole("button", { name: /add task/i });

      await userInteractions.type(input, "Test task");
      await userInteractions.click(addButton);

      // Fast-forward auto-save timer
      await act(async () => {
        vi.advanceTimersByTime(2000);
      });

      // Should only be called once from immediate save
      expect(mockOnTaskCapture).toHaveBeenCalledTimes(1);
    });
  });

  describe("keyboard shortcuts", () => {
    it("should clear input when Escape is pressed", async () => {
      render(<CaptureInput />);
      const input = screen.getByPlaceholderText("What's on your mind?");

      await userInteractions.type(input, "Test task");
      expect(input).toHaveValue("Test task");

      await userInteractions.keyboard("{Escape}");

      expect(input).toHaveValue("");
    });

    it("should call onDetailedCapture when Shift+Tab is pressed", async () => {
      render(<CaptureInput onDetailedCapture={mockOnDetailedCapture} />);
      const input = screen.getByPlaceholderText("What's on your mind?");

      input.focus();
      await userInteractions.keyboard("{Shift>}{Tab}{/Shift}");

      expect(mockOnDetailedCapture).toHaveBeenCalled();
    });

    it("should not call onDetailedCapture when Shift+Tab is pressed but onDetailedCapture is not provided", async () => {
      render(<CaptureInput />);
      const input = screen.getByPlaceholderText("What's on your mind?");

      input.focus();
      await userInteractions.keyboard("{Shift>}{Tab}{/Shift}");

      // Should not throw error
      expect(mockOnDetailedCapture).not.toHaveBeenCalled();
    });

    it("should display keyboard shortcuts hint on desktop", () => {
      render(<CaptureInput onDetailedCapture={mockOnDetailedCapture} />);

      expect(screen.getByText("Enter")).toBeInTheDocument();
      expect(screen.getByText("to save")).toBeInTheDocument();
      expect(screen.getByText("Esc")).toBeInTheDocument();
      expect(screen.getByText("to clear")).toBeInTheDocument();
      expect(screen.getByText("Shift+Tab")).toBeInTheDocument();
      expect(screen.getByText("for details")).toBeInTheDocument();
    });
  });

  describe("detailed capture", () => {
    it("should call onDetailedCapture when details button is clicked", async () => {
      render(<CaptureInput onDetailedCapture={mockOnDetailedCapture} />);
      const detailsButton = screen.getByRole("button", { name: /details/i });

      await userInteractions.click(detailsButton);

      expect(mockOnDetailedCapture).toHaveBeenCalled();
    });
  });

  describe("visual states and styling", () => {
    it("should apply enhanced styling when typing or input has content", async () => {
      render(<CaptureInput />);
      const input = screen.getByPlaceholderText("What's on your mind?");

      await userInteractions.type(input, "Test");

      const card = input.closest(".border-2");
      expect(card).toHaveClass("border-brand-teal/50");
      expect(card).toHaveClass("shadow-lg");
      expect(card).toHaveClass("ring-2");
      expect(card).toHaveClass("ring-brand-teal/20");
      expect(card).toHaveClass("scale-[1.02]");
    });

    it("should apply saving state opacity", async () => {
      const slowSave = vi.fn(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );
      render(<CaptureInput onTaskCapture={slowSave} />);
      const input = screen.getByPlaceholderText("What's on your mind?");
      const addButton = screen.getByRole("button", { name: /add task/i });

      await userInteractions.type(input, "Test task");
      await userInteractions.click(addButton);

      const card = input.closest(".border-2");
      expect(card).toHaveClass("opacity-70");
    });

    it("should show Plus icon in normal state", () => {
      render(<CaptureInput />);
      const addButton = screen.getByRole("button", { name: /add task/i });

      const plusIcon = addButton.querySelector("svg");
      expect(plusIcon).toBeInTheDocument();
    });
  });

  describe("accessibility features", () => {
    it("should have proper ARIA labels and roles", () => {
      render(<CaptureInput onDetailedCapture={mockOnDetailedCapture} />);

      const form = document.querySelector("form");
      expect(form).toBeInTheDocument();
      expect(screen.getByDisplayValue("")).toHaveAttribute("data-capture-input");
    });

    it("should prevent iOS zoom with appropriate font sizes", () => {
      render(<CaptureInput />);
      const input = screen.getByPlaceholderText("What's on your mind?");

      expect(input).toHaveClass("text-[16px]");
    });

    it("should have touch-friendly button sizes", () => {
      render(<CaptureInput onDetailedCapture={mockOnDetailedCapture} />);
      const addButton = screen.getByRole("button", { name: /add task/i });
      const detailsButton = screen.getByRole("button", { name: /details/i });

      expect(addButton).toHaveClass("min-h-[44px]");
      expect(detailsButton).toHaveClass("min-h-[44px]");
    });

    it("should have proper data attributes for testing", () => {
      render(<CaptureInput />);
      const input = screen.getByPlaceholderText("What's on your mind?");

      expect(input).toHaveAttribute("data-capture-input");
    });
  });

  describe("error handling", () => {
    it("should handle onTaskCapture being undefined", async () => {
      render(<CaptureInput />);
      const input = screen.getByPlaceholderText("What's on your mind?");
      const addButton = screen.getByRole("button", { name: /add task/i });

      await userInteractions.type(input, "Test task");
      await userInteractions.click(addButton);

      // Should not throw error
      expect(mockOnTaskCapture).not.toHaveBeenCalled();
    });

    it("should handle generic errors gracefully", async () => {
      const failingSave = vi.fn().mockRejectedValue("Generic error");
      render(<CaptureInput onTaskCapture={failingSave} />);
      const input = screen.getByPlaceholderText("What's on your mind?");
      const addButton = screen.getByRole("button", { name: /add task/i });

      await userInteractions.type(input, "Test task");
      await userInteractions.click(addButton);

      // Wait for async operation to complete
      await act(async () => {
        await Promise.resolve(); // Let promises settle
      });

      expect(toast.error).toHaveBeenCalledWith("Failed to save task");
    });

    it("should handle Error objects correctly", async () => {
      const failingSave = vi.fn().mockRejectedValue(new Error("Network error"));
      render(<CaptureInput onTaskCapture={failingSave} />);
      const input = screen.getByPlaceholderText("What's on your mind?");
      const addButton = screen.getByRole("button", { name: /add task/i });

      await userInteractions.type(input, "Test task");
      await userInteractions.click(addButton);

      // Wait for async operation to complete
      await act(async () => {
        await Promise.resolve(); // Let promises settle
      });

      expect(toast.error).toHaveBeenCalledWith("Network error");
    });
  });

  describe("form submission", () => {
    it("should prevent default form submission", async () => {
      render(<CaptureInput onTaskCapture={mockOnTaskCapture} />);
      const form = document.querySelector("form")!;

      const event = new Event("submit", { bubbles: true });
      const preventDefaultSpy = vi.spyOn(event, "preventDefault");

      fireEvent(form, event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe("cleanup and memory management", () => {
    it("should clear timeouts on unmount", () => {
      const { unmount } = render(
        <CaptureInput onTaskCapture={mockOnTaskCapture} />
      );

      // This should not throw any errors
      unmount();
    });

    it("should focus input after successful save", async () => {
      render(<CaptureInput onTaskCapture={mockOnTaskCapture} />);
      const input = screen.getByPlaceholderText("What's on your mind?");
      const addButton = screen.getByRole("button", { name: /add task/i });

      await userInteractions.type(input, "Test task");
      await userInteractions.click(addButton);

      // Wait for async operation to complete
      await act(async () => {
        await Promise.resolve(); // Let promises settle
      });

      expect(input).toHaveValue("");

      // Advance the focus timeout
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      expect(input).toHaveFocus();
    });
  });

  describe("responsive design", () => {
    it("should have responsive classes for different screen sizes", () => {
      render(<CaptureInput />);
      const input = screen.getByPlaceholderText("What's on your mind?");
      const addButton = screen.getByRole("button", { name: /add task/i });

      expect(input).toHaveClass("text-[16px]", "sm:text-[14px]", "md:text-[16px]");
      expect(addButton).toHaveClass("sm:h-8", "sm:px-2", "sm:min-w-0");
    });

    it("should hide details button on extra small screens when provided", () => {
      render(<CaptureInput onDetailedCapture={mockOnDetailedCapture} />);
      const detailsButton = screen.getByRole("button", { name: /details/i });

      expect(detailsButton).toHaveClass("hidden", "xs:flex");
    });
  });
});