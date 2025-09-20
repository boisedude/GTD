"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2, Clock, FolderOpen, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaskStatus, CreateTaskInput } from "@/types/database";

interface QuickCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreate?: (task: CreateTaskInput) => Promise<void>;
  initialTitle?: string;
  className?: string;
}

const taskStatusOptions: {
  value: TaskStatus;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "captured",
    label: "Captured",
    description: "Just captured, needs clarification",
    icon: <Clock className="h-4 w-4" />,
  },
  {
    value: "next_action",
    label: "Next Action",
    description: "Ready to work on",
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  {
    value: "project",
    label: "Project",
    description: "Multi-step outcome",
    icon: <FolderOpen className="h-4 w-4" />,
  },
  {
    value: "waiting_for",
    label: "Waiting For",
    description: "Blocked on someone else",
    icon: <Clock className="h-4 w-4" />,
  },
  {
    value: "someday",
    label: "Someday/Maybe",
    description: "Not active right now",
    icon: <Clock className="h-4 w-4" />,
  },
];

export function QuickCaptureModal({
  isOpen,
  onClose,
  onTaskCreate,
  initialTitle = "",
  className,
}: QuickCaptureModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("captured");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const titleInputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle);
      setDescription("");
      setStatus("captured");
      setError(null);
      setIsSubmitting(false);

      // Focus title input when modal opens
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, initialTitle]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !onTaskCreate || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const taskData: CreateTaskInput = {
        title: title.trim(),
        description: description.trim() || undefined,
        status,
      };

      await onTaskCreate(taskData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && !isSubmitting) {
      onClose();
    } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Quick status selection
  const handleStatusSelect = (selectedStatus: TaskStatus) => {
    setStatus(selectedStatus);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "w-[95vw] max-w-[600px] max-h-[90vh] sm:max-h-[85vh] overflow-y-auto",
          "mx-auto my-4 sm:my-8 p-4 sm:p-6",
          "rounded-lg sm:rounded-xl",
          className
        )}
        onKeyDown={handleKeyDown}
      >
        <DialogHeader>
          <DialogTitle>Capture Task Details</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Title Input - Mobile optimized */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              What needs to be done? *
            </Label>
            <Input
              id="title"
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title..."
              disabled={isSubmitting}
              maxLength={500}
              required
              className="text-base sm:text-sm" // Prevent iOS zoom
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="sentences"
            />
          </div>

          {/* Description - Mobile optimized */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Additional details (optional)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Any additional context, notes, or details..."
              disabled={isSubmitting}
              rows={3}
              maxLength={2000}
              className="text-base sm:text-sm" // Prevent iOS zoom
              autoComplete="off"
              autoCorrect="on"
              autoCapitalize="sentences"
            />
          </div>

          {/* Status Selection - Mobile optimized */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              How would you categorize this?
            </Label>
            <div className="grid grid-cols-1 gap-2">
              {taskStatusOptions.map((option) => (
                <Card
                  key={option.value}
                  className={cn(
                    "p-3 cursor-pointer transition-all duration-200 hover:shadow-md active:scale-95",
                    "border-2 min-h-[48px] flex items-center",
                    status === option.value
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/50"
                  )}
                  onClick={() => handleStatusSelect(option.value)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div
                      className={cn(
                        "flex-shrink-0",
                        status === option.value
                          ? "text-primary"
                          : "text-muted-foreground"
                      )}
                    >
                      {option.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={cn(
                          "font-medium text-sm leading-tight",
                          status === option.value
                            ? "text-primary"
                            : "text-foreground"
                        )}
                      >
                        {option.label}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 leading-tight">
                        {option.description}
                      </div>
                    </div>
                    {status === option.value && (
                      <div className="flex-shrink-0 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Action Buttons - Mobile optimized */}
          <DialogFooter className="gap-2 sm:gap-3 flex-col-reverse sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto min-h-[44px] text-sm font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || isSubmitting}
              className="w-full sm:w-auto min-w-[120px] min-h-[44px] text-sm font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Create Task"
              )}
            </Button>
          </DialogFooter>
        </form>

        {/* Keyboard Shortcuts Hint - Hidden on mobile */}
        <div className="pt-2 border-t hidden sm:block">
          <p className="text-xs text-muted-foreground text-center">
            <kbd className="px-1 py-0.5 bg-muted rounded text-xs">
              Cmd/Ctrl + Enter
            </kbd>{" "}
            to save •
            <kbd className="px-1 py-0.5 bg-muted rounded text-xs ml-1">Esc</kbd>{" "}
            to cancel
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
