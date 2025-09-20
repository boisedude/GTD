import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, rtlWaitFor } from "../../utils/test-utils";
import { userInteractions } from "../../utils/test-utils";
import { TaskCard } from "@/components/gtd/TaskCard";
import { useTaskHighlight } from "@/contexts/task-highlight-context";
import type { Task, TaskStatus, TaskContext, TaskEnergyLevel } from "@/types/database";

// Mock dependencies
vi.mock("@/contexts/task-highlight-context");
vi.mock("@/components/ui/confirm-dialog", () => ({
  DeleteConfirmDialog: ({ children, onConfirm, open, onOpenChange, isLoading }: any) => (
    <div data-testid="delete-dialog" style={{ display: open ? "block" : "none" }}>
      <button onClick={onConfirm} disabled={isLoading} data-testid="confirm-delete">
        {isLoading ? "Deleting..." : "Confirm Delete"}
      </button>
      <button onClick={() => onOpenChange(false)} data-testid="cancel-delete">
        Cancel
      </button>
      {children}
    </div>
  ),
}));

const mockUseTaskHighlight = vi.mocked(useTaskHighlight);

describe("TaskCard", () => {
  const baseTask: Task = {
    id: "task-1",
    user_id: "user-1",
    title: "Test Task",
    description: "This is a test task",
    status: "next_action",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
    completed_at: null,
    due_date: null,
    priority: null,
    context: null,
    energy_level: null,
    estimated_duration: null,
    waiting_for: null,
    tags: null,
    project_id: null,
  };

  const mockCallbacks = {
    onEdit: vi.fn(),
    onDelete: vi.fn().mockResolvedValue(undefined),
    onComplete: vi.fn().mockResolvedValue(undefined),
    onStatusChange: vi.fn(),
    onDragStart: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTaskHighlight.mockReturnValue({
      shouldHighlight: vi.fn().mockReturnValue(false),
      highlightTasks: vi.fn(),
    });
  });

  describe("basic rendering", () => {
    it("should render task title and description", () => {
      render(<TaskCard task={baseTask} />);

      expect(screen.getByText("Test Task")).toBeInTheDocument();
      expect(screen.getByText("This is a test task")).toBeInTheDocument();
    });

    it("should render without description when not provided", () => {
      const taskWithoutDescription = { ...baseTask, description: null };
      render(<TaskCard task={taskWithoutDescription} />);

      expect(screen.getByText("Test Task")).toBeInTheDocument();
      expect(screen.queryByText("This is a test task")).not.toBeInTheDocument();
    });

    it("should render in compact mode", () => {
      render(<TaskCard task={baseTask} compact />);

      expect(screen.getByText("Test Task")).toBeInTheDocument();
      // Description should be hidden in compact mode
      expect(screen.queryByText("This is a test task")).not.toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const { container } = render(
        <TaskCard task={baseTask} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass("custom-class");
    });
  });

  describe("completion functionality", () => {
    it("should render incomplete task with circle icon", () => {
      render(<TaskCard task={baseTask} onComplete={mockCallbacks.onComplete} />);

      const buttons = screen.getAllByRole("button");
      const completeButton = buttons.find(btn => btn.querySelector('.lucide-circle'));
      expect(completeButton).toBeInTheDocument();
      expect(completeButton!.querySelector("svg")).toBeInTheDocument();
    });

    it("should render completed task with check icon", () => {
      const completedTask = { ...baseTask, status: "completed" as TaskStatus };
      render(<TaskCard task={completedTask} onComplete={mockCallbacks.onComplete} />);

      const title = screen.getByText("Test Task");
      expect(title).toHaveClass("line-through", "text-brand-gray-500");
    });

    it("should call onComplete when completion button is clicked", async () => {
      render(<TaskCard task={baseTask} onComplete={mockCallbacks.onComplete} />);

      const buttons = screen.getAllByRole("button");
      const completeButton = buttons.find(btn => btn.querySelector('.lucide-circle'));
      await userInteractions.click(completeButton!);

      expect(mockCallbacks.onComplete).toHaveBeenCalledWith("task-1", true);
    });

    it("should show loading state during completion", async () => {
      const slowComplete = vi.fn(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );
      render(<TaskCard task={baseTask} onComplete={slowComplete} />);

      const buttons = screen.getAllByRole("button");
      const completeButton = buttons.find(btn => btn.querySelector('.lucide-circle'));
      await userInteractions.click(completeButton!);

      // Should show loading spinner
      expect(completeButton!.querySelector(".animate-spin")).toBeInTheDocument();
      expect(completeButton).toBeDisabled();
    });

    it("should handle completion errors gracefully", async () => {
      const failingComplete = vi.fn().mockRejectedValue(new Error("Network error"));
      render(<TaskCard task={baseTask} onComplete={failingComplete} />);

      const buttons = screen.getAllByRole("button");
      const completeButton = buttons.find(btn => btn.querySelector('.lucide-circle'));
      await userInteractions.click(completeButton!);

      await rtlWaitFor(() => {
        expect(completeButton).not.toBeDisabled();
      });
    });
  });

  describe("context and metadata display", () => {
    it("should display context with appropriate icon", () => {
      const taskWithContext = { ...baseTask, context: "office" as TaskContext };
      render(<TaskCard task={taskWithContext} />);

      expect(screen.getByText("@office")).toBeInTheDocument();
    });

    it("should display energy level with appropriate styling", () => {
      const taskWithEnergy = { ...baseTask, energy_level: "high" as TaskEnergyLevel };
      render(<TaskCard task={taskWithEnergy} />);

      expect(screen.getByText("high")).toBeInTheDocument();
    });

    it("should display estimated duration", () => {
      const taskWithDuration = { ...baseTask, estimated_duration: "30min" };
      render(<TaskCard task={taskWithDuration} />);

      expect(screen.getByText("30min")).toBeInTheDocument();
    });

    it("should display waiting for information", () => {
      const taskWithWaiting = { ...baseTask, waiting_for: "John's approval" };
      render(<TaskCard task={taskWithWaiting} />);

      expect(screen.getByText("Waiting: John's approval")).toBeInTheDocument();
    });

    it("should display custom tags", () => {
      const taskWithTags = { ...baseTask, tags: ["urgent", "important"] };
      render(<TaskCard task={taskWithTags} />);

      expect(screen.getByText("urgent")).toBeInTheDocument();
      expect(screen.getByText("important")).toBeInTheDocument();
    });

    it("should display high priority flag", () => {
      const highPriorityTask = { ...baseTask, priority: 1 };
      render(<TaskCard task={highPriorityTask} />);

      expect(screen.getByText("High")).toBeInTheDocument();
    });

    it("should not display priority flag for low priority", () => {
      const lowPriorityTask = { ...baseTask, priority: 5 };
      render(<TaskCard task={lowPriorityTask} />);

      expect(screen.queryByText("High")).not.toBeInTheDocument();
    });
  });

  describe("due date functionality", () => {
    it("should display due date", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const taskWithDueDate = { ...baseTask, due_date: futureDate.toISOString() };
      render(<TaskCard task={taskWithDueDate} />);

      expect(screen.getByText(futureDate.toLocaleDateString())).toBeInTheDocument();
    });

    it("should show 'Today' for tasks due today", () => {
      const today = new Date().toISOString();
      const taskDueToday = { ...baseTask, due_date: today };
      render(<TaskCard task={taskDueToday} />);

      expect(screen.getByText("Today")).toBeInTheDocument();
    });

    it("should show 'Overdue' and apply warning styles for overdue tasks", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const overdueTask = { ...baseTask, due_date: pastDate.toISOString() };
      const { container } = render(<TaskCard task={overdueTask} />);

      expect(screen.getByText("Overdue")).toBeInTheDocument();
      expect(container.firstChild).toHaveClass("ring-2", "ring-error/30", "animate-pulse");
    });

    it("should not show overdue styling for completed tasks", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const completedOverdueTask = {
        ...baseTask,
        due_date: pastDate.toISOString(),
        status: "completed" as TaskStatus,
      };
      const { container } = render(<TaskCard task={completedOverdueTask} />);

      expect(container.firstChild).not.toHaveClass("animate-pulse");
    });
  });

  describe("actions menu", () => {
    it("should render actions menu button", () => {
      render(
        <TaskCard
          task={baseTask}
          onEdit={mockCallbacks.onEdit}
          onDelete={mockCallbacks.onDelete}
          onStatusChange={mockCallbacks.onStatusChange}
        />
      );

      const buttons = screen.getAllByRole("button");
      const menuButton = buttons.find(btn => btn.querySelector('.lucide-ellipsis') || btn.querySelector('.lucide-more-horizontal'));
      expect(menuButton).toBeInTheDocument();
    });

    it("should show edit option when onEdit is provided", async () => {
      render(<TaskCard task={baseTask} onEdit={mockCallbacks.onEdit} />);

      const buttons = screen.getAllByRole("button");
      const menuButton = buttons.find(btn => btn.querySelector('.lucide-ellipsis') || btn.querySelector('.lucide-more-horizontal'));
      await userInteractions.click(menuButton!);

      expect(screen.getByText("Edit Task")).toBeInTheDocument();
    });

    it("should call onEdit when edit is clicked", async () => {
      render(<TaskCard task={baseTask} onEdit={mockCallbacks.onEdit} />);

      const buttons = screen.getAllByRole("button");
      const menuButton = buttons.find(btn => btn.querySelector('.lucide-ellipsis') || btn.querySelector('.lucide-more-horizontal'));
      await userInteractions.click(menuButton!);

      const editOption = screen.getByText("Edit Task");
      await userInteractions.click(editOption);

      expect(mockCallbacks.onEdit).toHaveBeenCalledWith(baseTask);
    });

    it("should show completion option in menu", async () => {
      render(<TaskCard task={baseTask} onComplete={mockCallbacks.onComplete} />);

      const buttons = screen.getAllByRole("button");
      const menuButton = buttons.find(btn => btn.querySelector('.lucide-ellipsis') || btn.querySelector('.lucide-more-horizontal'));
      await userInteractions.click(menuButton!);

      expect(screen.getByText("Mark Complete")).toBeInTheDocument();
    });

    it("should show status change options when onStatusChange is provided", async () => {
      render(<TaskCard task={baseTask} onStatusChange={mockCallbacks.onStatusChange} />);

      const buttons = screen.getAllByRole("button");
      const menuButton = buttons.find(btn => btn.querySelector('.lucide-ellipsis') || btn.querySelector('.lucide-more-horizontal'));
      await userInteractions.click(menuButton!);

      expect(screen.getByText("Move to Next Actions")).toBeInTheDocument();
      expect(screen.getByText("Move to Waiting For")).toBeInTheDocument();
      expect(screen.getByText("Move to Someday/Maybe")).toBeInTheDocument();
      expect(screen.getByText("Convert to Project")).toBeInTheDocument();
    });

    it("should call onStatusChange when status option is clicked", async () => {
      render(<TaskCard task={baseTask} onStatusChange={mockCallbacks.onStatusChange} />);

      const buttons = screen.getAllByRole("button");
      const menuButton = buttons.find(btn => btn.querySelector('.lucide-ellipsis') || btn.querySelector('.lucide-more-horizontal'));
      await userInteractions.click(menuButton!);

      const waitingOption = screen.getByText("Move to Waiting For");
      await userInteractions.click(waitingOption);

      expect(mockCallbacks.onStatusChange).toHaveBeenCalledWith("task-1", "waiting_for");
    });

    it("should show delete option when onDelete is provided", async () => {
      render(<TaskCard task={baseTask} onDelete={mockCallbacks.onDelete} />);

      const buttons = screen.getAllByRole("button");
      const menuButton = buttons.find(btn => btn.querySelector('.lucide-ellipsis') || btn.querySelector('.lucide-more-horizontal'));
      await userInteractions.click(menuButton!);

      expect(screen.getByText("Delete")).toBeInTheDocument();
    });
  });

  describe("delete functionality", () => {
    it("should open delete confirmation dialog when delete is clicked", async () => {
      render(<TaskCard task={baseTask} onDelete={mockCallbacks.onDelete} />);

      const buttons = screen.getAllByRole("button");
      const menuButton = buttons.find(btn => btn.querySelector('.lucide-ellipsis') || btn.querySelector('.lucide-more-horizontal'));
      await userInteractions.click(menuButton!);

      const deleteOption = screen.getByText("Delete");
      await userInteractions.click(deleteOption);

      expect(screen.getByTestId("delete-dialog")).toBeVisible();
    });

    it("should call onDelete when deletion is confirmed", async () => {
      render(<TaskCard task={baseTask} onDelete={mockCallbacks.onDelete} />);

      const buttons = screen.getAllByRole("button");
      const menuButton = buttons.find(btn => btn.querySelector('.lucide-ellipsis') || btn.querySelector('.lucide-more-horizontal'));
      await userInteractions.click(menuButton!);

      const deleteOption = screen.getByText("Delete");
      await userInteractions.click(deleteOption);

      const confirmButton = screen.getByTestId("confirm-delete");
      await userInteractions.click(confirmButton);

      expect(mockCallbacks.onDelete).toHaveBeenCalledWith("task-1");
    });

    it("should show loading state during deletion", async () => {
      const slowDelete = vi.fn(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );
      render(<TaskCard task={baseTask} onDelete={slowDelete} />);

      const buttons = screen.getAllByRole("button");
      const menuButton = buttons.find(btn => btn.querySelector('.lucide-ellipsis') || btn.querySelector('.lucide-more-horizontal'));
      await userInteractions.click(menuButton!);

      const deleteOption = screen.getByText("Delete");
      await userInteractions.click(deleteOption);

      const confirmButton = screen.getByTestId("confirm-delete");
      await userInteractions.click(confirmButton);

      expect(confirmButton).toHaveTextContent("Deleting...");
      expect(confirmButton).toBeDisabled();
    });

    it("should close dialog and reset state after successful deletion", async () => {
      render(<TaskCard task={baseTask} onDelete={mockCallbacks.onDelete} />);

      const buttons = screen.getAllByRole("button");
      const menuButton = buttons.find(btn => btn.querySelector('.lucide-ellipsis') || btn.querySelector('.lucide-more-horizontal'));
      await userInteractions.click(menuButton!);

      const deleteOption = screen.getByText("Delete");
      await userInteractions.click(deleteOption);

      const confirmButton = screen.getByTestId("confirm-delete");
      await userInteractions.click(confirmButton);

      await rtlWaitFor(() => {
        expect(screen.getByTestId("delete-dialog")).not.toBeVisible();
      });
    });

    it("should handle deletion errors gracefully", async () => {
      const failingDelete = vi.fn().mockRejectedValue(new Error("Network error"));
      render(<TaskCard task={baseTask} onDelete={failingDelete} />);

      const buttons = screen.getAllByRole("button");
      const menuButton = buttons.find(btn => btn.querySelector('.lucide-ellipsis') || btn.querySelector('.lucide-more-horizontal'));
      await userInteractions.click(menuButton!);

      const deleteOption = screen.getByText("Delete");
      await userInteractions.click(deleteOption);

      const confirmButton = screen.getByTestId("confirm-delete");
      await userInteractions.click(confirmButton);

      await rtlWaitFor(() => {
        expect(confirmButton).not.toBeDisabled();
      });
    });

    it("should cancel deletion when cancel is clicked", async () => {
      render(<TaskCard task={baseTask} onDelete={mockCallbacks.onDelete} />);

      const buttons = screen.getAllByRole("button");
      const menuButton = buttons.find(btn => btn.querySelector('.lucide-ellipsis') || btn.querySelector('.lucide-more-horizontal'));
      await userInteractions.click(menuButton!);

      const deleteOption = screen.getByText("Delete");
      await userInteractions.click(deleteOption);

      const cancelButton = screen.getByTestId("cancel-delete");
      await userInteractions.click(cancelButton);

      expect(screen.getByTestId("delete-dialog")).not.toBeVisible();
      expect(mockCallbacks.onDelete).not.toHaveBeenCalled();
    });
  });

  describe("drag and drop", () => {
    it("should be draggable when onDragStart is provided", () => {
      const { container } = render(
        <TaskCard task={baseTask} onDragStart={mockCallbacks.onDragStart} />
      );

      expect(container.firstChild).toHaveAttribute("draggable", "true");
    });

    it("should not be draggable when onDragStart is not provided", () => {
      const { container } = render(<TaskCard task={baseTask} />);

      expect(container.firstChild).toHaveAttribute("draggable", "false");
    });

    it("should call onDragStart when drag starts", () => {
      const { container } = render(
        <TaskCard task={baseTask} onDragStart={mockCallbacks.onDragStart} />
      );

      fireEvent.dragStart(container.firstChild!);

      expect(mockCallbacks.onDragStart).toHaveBeenCalledWith(baseTask);
    });
  });

  describe("highlighting", () => {
    it("should apply highlight styling when shouldHighlight returns true", () => {
      mockUseTaskHighlight.mockReturnValue({
        shouldHighlight: vi.fn().mockReturnValue(true),
        highlightTasks: vi.fn(),
      });

      const { container } = render(<TaskCard task={baseTask} />);

      expect(container.firstChild).toHaveClass(
        "ring-2",
        "ring-yellow-400/50",
        "shadow-lg",
        "shadow-yellow-400/20"
      );
    });

    it("should show highlight indicator when highlighted", () => {
      mockUseTaskHighlight.mockReturnValue({
        shouldHighlight: vi.fn().mockReturnValue(true),
        highlightTasks: vi.fn(),
      });

      render(<TaskCard task={baseTask} />);

      const indicator = document.querySelector(".absolute.-top-2.-right-2");
      expect(indicator).toBeInTheDocument();
    });

    it("should not show highlight indicator when not highlighted", () => {
      render(<TaskCard task={baseTask} />);

      const indicator = document.querySelector(".absolute.-top-2.-right-2");
      expect(indicator).not.toBeInTheDocument();
    });
  });

  describe("priority styling", () => {
    it("should apply high priority styling", () => {
      const highPriorityTask = { ...baseTask, priority: 1 };
      const { container } = render(<TaskCard task={highPriorityTask} />);

      expect(container.firstChild).toHaveClass("border-l-error", "bg-error/5");
    });

    it("should apply medium priority styling", () => {
      const mediumPriorityTask = { ...baseTask, priority: 3 };
      const { container } = render(<TaskCard task={mediumPriorityTask} />);

      expect(container.firstChild).toHaveClass("border-l-warning", "bg-warning/5");
    });

    it("should apply low priority styling", () => {
      const lowPriorityTask = { ...baseTask, priority: 5 };
      const { container } = render(<TaskCard task={lowPriorityTask} />);

      expect(container.firstChild).toHaveClass("border-l-brand-gray-400", "bg-brand-gray-50");
    });
  });

  describe("accessibility", () => {
    it("should have proper touch targets", () => {
      render(
        <TaskCard
          task={baseTask}
          onComplete={mockCallbacks.onComplete}
          onEdit={mockCallbacks.onEdit}
        />
      );

      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).toHaveClass("min-h-[44px]");
        expect(button).toHaveClass("touch-manipulation");
      });
    });

    it("should have proper focus styles", () => {
      const { container } = render(<TaskCard task={baseTask} />);

      expect(container.firstChild).toHaveClass("focus-within:ring-2", "focus-within:ring-brand-teal/20");
    });

    it("should have proper hover effects", () => {
      const { container } = render(<TaskCard task={baseTask} />);

      expect(container.firstChild).toHaveClass(
        "hover:shadow-lg",
        "hover:shadow-brand-teal/10",
        "hover:-translate-y-1"
      );
    });
  });

  describe("responsive design", () => {
    it("should have responsive action menu visibility", () => {
      render(<TaskCard task={baseTask} onEdit={mockCallbacks.onEdit} />);

      const buttons = screen.getAllByRole("button");
      const menuButton = buttons.find(btn => btn.querySelector('.lucide-ellipsis') || btn.querySelector('.lucide-more-horizontal'));
      expect(menuButton).toHaveClass(
        "opacity-0",
        "md:group-hover:opacity-100",
        "lg:opacity-0",
        "lg:group-hover:opacity-100",
        "opacity-100",
        "sm:opacity-0"
      );
    });

    it("should have responsive text sizing", () => {
      render(<TaskCard task={baseTask} />);

      const title = screen.getByText("Test Task");
      expect(title).toHaveClass("text-brand-base");
    });

    it("should have responsive text sizing in compact mode", () => {
      render(<TaskCard task={baseTask} compact />);

      const title = screen.getByText("Test Task");
      expect(title).toHaveClass("text-brand-sm");
    });
  });

  describe("energy level styling", () => {
    it("should apply high energy styling", () => {
      const highEnergyTask = { ...baseTask, energy_level: "high" as TaskEnergyLevel };
      render(<TaskCard task={highEnergyTask} />);

      const energyElement = screen.getByText("high").closest("div");
      expect(energyElement).toHaveClass("text-error");
    });

    it("should apply medium energy styling", () => {
      const mediumEnergyTask = { ...baseTask, energy_level: "medium" as TaskEnergyLevel };
      render(<TaskCard task={mediumEnergyTask} />);

      const energyElement = screen.getByText("medium").closest("div");
      expect(energyElement).toHaveClass("text-warning");
    });

    it("should apply low energy styling", () => {
      const lowEnergyTask = { ...baseTask, energy_level: "low" as TaskEnergyLevel };
      render(<TaskCard task={lowEnergyTask} />);

      const energyElement = screen.getByText("low").closest("div");
      expect(energyElement).toHaveClass("text-success");
    });
  });
});