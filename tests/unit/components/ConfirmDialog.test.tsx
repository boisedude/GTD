import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, rtlWaitFor } from "../../utils/test-utils";
import { userInteractions } from "../../utils/test-utils";
import {
  ConfirmDialog,
  DeleteConfirmDialog,
  ArchiveConfirmDialog,
} from "@/components/ui/confirm-dialog";

describe("ConfirmDialog", () => {
  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("basic functionality", () => {
    it("should render trigger children", () => {
      render(
        <ConfirmDialog onConfirm={mockOnConfirm}>
          <button>Delete Item</button>
        </ConfirmDialog>
      );

      expect(screen.getByRole("button", { name: "Delete Item" })).toBeInTheDocument();
    });

    it("should open dialog when trigger is clicked", async () => {
      render(
        <ConfirmDialog onConfirm={mockOnConfirm}>
          <button>Delete Item</button>
        </ConfirmDialog>
      );

      await userInteractions.click(screen.getByRole("button", { name: "Delete Item" }));

      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    });

    it("should call onConfirm when confirm button is clicked", async () => {
      render(
        <ConfirmDialog onConfirm={mockOnConfirm}>
          <button>Delete Item</button>
        </ConfirmDialog>
      );

      await userInteractions.click(screen.getByRole("button", { name: "Delete Item" }));
      await userInteractions.click(screen.getByRole("button", { name: /Confirm default action/i }));

      expect(mockOnConfirm).toHaveBeenCalled();
    });

    it("should call onCancel when cancel button is clicked", async () => {
      render(
        <ConfirmDialog onConfirm={mockOnConfirm} onCancel={mockOnCancel}>
          <button>Delete Item</button>
        </ConfirmDialog>
      );

      await userInteractions.click(screen.getByRole("button", { name: "Delete Item" }));
      await userInteractions.click(screen.getByRole("button", { name: /Cancel default action/i }));

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it("should close dialog after successful confirmation", async () => {
      render(
        <ConfirmDialog onConfirm={mockOnConfirm} onOpenChange={mockOnOpenChange}>
          <button>Delete Item</button>
        </ConfirmDialog>
      );

      await userInteractions.click(screen.getByRole("button", { name: "Delete Item" }));
      await userInteractions.click(screen.getByRole("button", { name: /Confirm default action/i }));

      await rtlWaitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it("should close dialog when cancel is clicked", async () => {
      render(
        <ConfirmDialog onConfirm={mockOnConfirm} onOpenChange={mockOnOpenChange}>
          <button>Delete Item</button>
        </ConfirmDialog>
      );

      await userInteractions.click(screen.getByRole("button", { name: "Delete Item" }));
      await userInteractions.click(screen.getByRole("button", { name: /Cancel default action/i }));

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe("variants", () => {
    it("should render destructive variant correctly", async () => {
      render(
        <ConfirmDialog variant="destructive" onConfirm={mockOnConfirm}>
          <button>Delete Item</button>
        </ConfirmDialog>
      );

      await userInteractions.click(screen.getByRole("button", { name: "Delete Item" }));

      expect(screen.getByText("Delete Item")).toBeInTheDocument();
      expect(screen.getByText("This action cannot be undone. Are you sure you want to delete this item?")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Confirm destructive action/i })).toBeInTheDocument();
    });

    it("should render warning variant correctly", async () => {
      render(
        <ConfirmDialog variant="warning" onConfirm={mockOnConfirm}>
          <button>Archive Item</button>
        </ConfirmDialog>
      );

      await userInteractions.click(screen.getByRole("button", { name: "Archive Item" }));

      expect(screen.getByText("Confirm Action")).toBeInTheDocument();
      expect(screen.getByText("Are you sure you want to continue with this action?")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Confirm warning action/i })).toBeInTheDocument();
    });

    it("should render default variant correctly", async () => {
      render(
        <ConfirmDialog variant="default" onConfirm={mockOnConfirm}>
          <button>Update Item</button>
        </ConfirmDialog>
      );

      await userInteractions.click(screen.getByRole("button", { name: "Update Item" }));

      expect(screen.getByText("Confirm Action")).toBeInTheDocument();
      expect(screen.getByText("Are you sure you want to perform this action?")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Confirm default action/i })).toBeInTheDocument();
    });
  });

  describe("custom content", () => {
    it("should use custom title when provided", async () => {
      render(
        <ConfirmDialog
          title="Custom Title"
          onConfirm={mockOnConfirm}
        >
          <button>Trigger</button>
        </ConfirmDialog>
      );

      await userInteractions.click(screen.getByRole("button", { name: "Trigger" }));

      expect(screen.getByText("Custom Title")).toBeInTheDocument();
    });

    it("should use custom description when provided", async () => {
      render(
        <ConfirmDialog
          description="Custom description for this action"
          onConfirm={mockOnConfirm}
        >
          <button>Trigger</button>
        </ConfirmDialog>
      );

      await userInteractions.click(screen.getByRole("button", { name: "Trigger" }));

      expect(screen.getByText("Custom description for this action")).toBeInTheDocument();
    });

    it("should use custom confirm text when provided", async () => {
      render(
        <ConfirmDialog
          confirmText="Custom Confirm"
          onConfirm={mockOnConfirm}
        >
          <button>Trigger</button>
        </ConfirmDialog>
      );

      await userInteractions.click(screen.getByRole("button", { name: "Trigger" }));

      expect(screen.getByText("Custom Confirm")).toBeInTheDocument();
    });

    it("should use custom cancel text when provided", async () => {
      render(
        <ConfirmDialog
          cancelText="Custom Cancel"
          onConfirm={mockOnConfirm}
        >
          <button>Trigger</button>
        </ConfirmDialog>
      );

      await userInteractions.click(screen.getByRole("button", { name: "Trigger" }));

      expect(screen.getByText("Custom Cancel")).toBeInTheDocument();
    });
  });

  describe("loading state", () => {
    it("should show loading state when isLoading is true", async () => {
      render(
        <ConfirmDialog isLoading onConfirm={mockOnConfirm}>
          <button>Trigger</button>
        </ConfirmDialog>
      );

      await userInteractions.click(screen.getByRole("button", { name: "Trigger" }));

      expect(screen.getByText("Processing...")).toBeInTheDocument();
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("should disable buttons during loading", async () => {
      render(
        <ConfirmDialog isLoading onConfirm={mockOnConfirm}>
          <button>Trigger</button>
        </ConfirmDialog>
      );

      await userInteractions.click(screen.getByRole("button", { name: "Trigger" }));

      expect(screen.getByRole("button", { name: /Confirm default action/i })).toBeDisabled();
      expect(screen.getByRole("button", { name: /Cancel default action/i })).toBeDisabled();
    });

    it("should show loading spinner", async () => {
      render(
        <ConfirmDialog isLoading onConfirm={mockOnConfirm}>
          <button>Trigger</button>
        </ConfirmDialog>
      );

      await userInteractions.click(screen.getByRole("button", { name: "Trigger" }));

      const spinner = document.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });
  });

  describe("controlled mode", () => {
    it("should respect open prop", () => {
      render(
        <ConfirmDialog
          open={true}
          onConfirm={mockOnConfirm}
          onOpenChange={mockOnOpenChange}
        >
          <button>Trigger</button>
        </ConfirmDialog>
      );

      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    });

    it("should not show dialog when open is false", () => {
      render(
        <ConfirmDialog
          open={false}
          onConfirm={mockOnConfirm}
          onOpenChange={mockOnOpenChange}
        >
          <button>Trigger</button>
        </ConfirmDialog>
      );

      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });

    it("should call onOpenChange when dialog state changes", async () => {
      render(
        <ConfirmDialog
          open={true}
          onConfirm={mockOnConfirm}
          onOpenChange={mockOnOpenChange}
        >
          <button>Trigger</button>
        </ConfirmDialog>
      );

      await userInteractions.click(screen.getByRole("button", { name: /Cancel default action/i }));

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe("error handling", () => {
    it("should handle async onConfirm errors gracefully", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const failingConfirm = vi.fn().mockRejectedValue(new Error("Network error"));

      render(
        <ConfirmDialog onConfirm={failingConfirm}>
          <button>Trigger</button>
        </ConfirmDialog>
      );

      await userInteractions.click(screen.getByRole("button", { name: "Trigger" }));
      await userInteractions.click(screen.getByRole("button", { name: /Confirm default action/i }));

      await rtlWaitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith("Confirm action failed:", expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  describe("accessibility", () => {
    it("should have proper ARIA attributes", async () => {
      render(
        <ConfirmDialog onConfirm={mockOnConfirm}>
          <button>Trigger</button>
        </ConfirmDialog>
      );

      await userInteractions.click(screen.getByRole("button", { name: "Trigger" }));

      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    });

    it("should have proper icon accessibility", async () => {
      render(
        <ConfirmDialog variant="destructive" onConfirm={mockOnConfirm}>
          <button>Trigger</button>
        </ConfirmDialog>
      );

      await userInteractions.click(screen.getByRole("button", { name: "Trigger" }));

      expect(screen.getByLabelText("destructive action icon")).toBeInTheDocument();
    });

    it("should have aria-describedby during loading", async () => {
      render(
        <ConfirmDialog isLoading onConfirm={mockOnConfirm}>
          <button>Trigger</button>
        </ConfirmDialog>
      );

      await userInteractions.click(screen.getByRole("button", { name: "Trigger" }));

      const confirmButton = screen.getByRole("button", { name: /Confirm default action/i });
      expect(confirmButton).toHaveAttribute("aria-describedby", "confirm-loading");
    });

    it("should have proper button labels", async () => {
      render(
        <ConfirmDialog variant="warning" onConfirm={mockOnConfirm}>
          <button>Trigger</button>
        </ConfirmDialog>
      );

      await userInteractions.click(screen.getByRole("button", { name: "Trigger" }));

      expect(screen.getByLabelText("Confirm warning action")).toBeInTheDocument();
      expect(screen.getByLabelText("Cancel warning action")).toBeInTheDocument();
    });
  });

  describe("icon variants", () => {
    it("should show trash icon for destructive variant", async () => {
      render(
        <ConfirmDialog variant="destructive" onConfirm={mockOnConfirm}>
          <button>Trigger</button>
        </ConfirmDialog>
      );

      await userInteractions.click(screen.getByRole("button", { name: "Trigger" }));

      const iconContainer = screen.getByLabelText("destructive action icon");
      expect(iconContainer).toHaveClass("bg-error/10");
    });

    it("should show warning icon for warning variant", async () => {
      render(
        <ConfirmDialog variant="warning" onConfirm={mockOnConfirm}>
          <button>Trigger</button>
        </ConfirmDialog>
      );

      await userInteractions.click(screen.getByRole("button", { name: "Trigger" }));

      const iconContainer = screen.getByLabelText("warning action icon");
      expect(iconContainer).toHaveClass("bg-warning/10");
    });

    it("should show refresh icon for default variant", async () => {
      render(
        <ConfirmDialog variant="default" onConfirm={mockOnConfirm}>
          <button>Trigger</button>
        </ConfirmDialog>
      );

      await userInteractions.click(screen.getByRole("button", { name: "Trigger" }));

      const iconContainer = screen.getByLabelText("default action icon");
      expect(iconContainer).toHaveClass("bg-brand-teal/10");
    });
  });
});

describe("DeleteConfirmDialog", () => {
  const mockOnConfirm = vi.fn();
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render with default delete configuration", () => {
    render(
      <DeleteConfirmDialog onConfirm={mockOnConfirm} open={true}>
        <button>Delete</button>
      </DeleteConfirmDialog>
    );

    expect(screen.getByText("Delete item")).toBeInTheDocument();
    expect(screen.getByText("Are you sure you want to delete this item? This action cannot be undone.")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("should use custom item name in description", () => {
    render(
      <DeleteConfirmDialog
        itemName="My Task"
        onConfirm={mockOnConfirm}
        open={true}
      >
        <button>Delete</button>
      </DeleteConfirmDialog>
    );

    expect(screen.getByText('Are you sure you want to delete "My Task"? This action cannot be undone.')).toBeInTheDocument();
  });

  it("should use custom item type", () => {
    render(
      <DeleteConfirmDialog
        itemType="project"
        onConfirm={mockOnConfirm}
        open={true}
      >
        <button>Delete</button>
      </DeleteConfirmDialog>
    );

    expect(screen.getByText("Delete project")).toBeInTheDocument();
    expect(screen.getByText("Are you sure you want to delete this project? This action cannot be undone.")).toBeInTheDocument();
  });

  it("should show loading state", () => {
    render(
      <DeleteConfirmDialog
        isLoading
        onConfirm={mockOnConfirm}
        open={true}
      >
        <button>Delete</button>
      </DeleteConfirmDialog>
    );

    expect(screen.getByText("Processing...")).toBeInTheDocument();
  });

  it("should call onConfirm when delete is confirmed", async () => {
    render(
      <DeleteConfirmDialog onConfirm={mockOnConfirm} open={true}>
        <button>Delete</button>
      </DeleteConfirmDialog>
    );

    await userInteractions.click(screen.getByRole("button", { name: /Confirm destructive action/i }));

    expect(mockOnConfirm).toHaveBeenCalled();
  });
});

describe("ArchiveConfirmDialog", () => {
  const mockOnConfirm = vi.fn();
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render with default archive configuration", () => {
    render(
      <ArchiveConfirmDialog onConfirm={mockOnConfirm} open={true}>
        <button>Archive</button>
      </ArchiveConfirmDialog>
    );

    expect(screen.getByText("Archive item")).toBeInTheDocument();
    expect(screen.getByText("Are you sure you want to archive this item? You can restore it later from the archive.")).toBeInTheDocument();
    expect(screen.getByText("Archive")).toBeInTheDocument();
  });

  it("should use custom item name in description", () => {
    render(
      <ArchiveConfirmDialog
        itemName="Important Document"
        onConfirm={mockOnConfirm}
        open={true}
      >
        <button>Archive</button>
      </ArchiveConfirmDialog>
    );

    expect(screen.getByText('Are you sure you want to archive "Important Document"? You can restore it later from the archive.')).toBeInTheDocument();
  });

  it("should use custom item type", () => {
    render(
      <ArchiveConfirmDialog
        itemType="task"
        onConfirm={mockOnConfirm}
        open={true}
      >
        <button>Archive</button>
      </ArchiveConfirmDialog>
    );

    expect(screen.getByText("Archive task")).toBeInTheDocument();
    expect(screen.getByText("Are you sure you want to archive this task? You can restore it later from the archive.")).toBeInTheDocument();
  });

  it("should show loading state", () => {
    render(
      <ArchiveConfirmDialog
        isLoading
        onConfirm={mockOnConfirm}
        open={true}
      >
        <button>Archive</button>
      </ArchiveConfirmDialog>
    );

    expect(screen.getByText("Processing...")).toBeInTheDocument();
  });

  it("should call onConfirm when archive is confirmed", async () => {
    render(
      <ArchiveConfirmDialog onConfirm={mockOnConfirm} open={true}>
        <button>Archive</button>
      </ArchiveConfirmDialog>
    );

    await userInteractions.click(screen.getByRole("button", { name: /Confirm warning action/i }));

    expect(mockOnConfirm).toHaveBeenCalled();
  });

  it("should use warning variant", () => {
    render(
      <ArchiveConfirmDialog onConfirm={mockOnConfirm} open={true}>
        <button>Archive</button>
      </ArchiveConfirmDialog>
    );

    const iconContainer = screen.getByLabelText("warning action icon");
    expect(iconContainer).toHaveClass("bg-warning/10");
  });
});