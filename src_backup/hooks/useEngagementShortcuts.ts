"use client";

import { useEffect, useCallback } from "react";
import type { Task, TaskAction } from "@/types/database";

interface UseEngagementShortcutsOptions {
  selectedTask?: Task | null;
  onTaskAction?: (taskId: string, action: TaskAction) => Promise<void>;
  onSelectNext?: () => void;
  onSelectPrevious?: () => void;
  onOpenDetails?: () => void;
  onStartTimer?: () => void;
  onToggleFilters?: () => void;
  enabled?: boolean;
}

export function useEngagementShortcuts(
  options: UseEngagementShortcutsOptions = {}
) {
  const {
    selectedTask,
    onTaskAction,
    onSelectNext,
    onSelectPrevious,
    onOpenDetails,
    onStartTimer,
    onToggleFilters,
    enabled = true,
  } = options;

  const handleKeyDown = useCallback(
    async (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target as HTMLElement)?.contentEditable === "true"
      ) {
        return;
      }

      // Don't trigger if modifier keys are pressed (except for specific combinations)
      if (event.altKey || event.ctrlKey || event.metaKey) {
        // Allow specific modifier combinations
        if (event.metaKey || event.ctrlKey) {
          switch (event.key.toLowerCase()) {
            case "f":
              event.preventDefault();
              onToggleFilters?.();
              break;
          }
        }
        return;
      }

      switch (event.key.toLowerCase()) {
        // Navigation
        case "j":
        case "arrowdown":
          event.preventDefault();
          onSelectNext?.();
          break;

        case "k":
        case "arrowup":
          event.preventDefault();
          onSelectPrevious?.();
          break;

        // Task Actions (require selected task)
        case "enter":
          event.preventDefault();
          onOpenDetails?.();
          break;

        case "c":
          if (selectedTask && onTaskAction) {
            event.preventDefault();
            await onTaskAction(selectedTask.id, { type: "complete" });
          }
          break;

        case "d":
          if (selectedTask && onTaskAction) {
            event.preventDefault();
            await onTaskAction(selectedTask.id, { type: "defer" });
          }
          break;

        case "w":
          if (selectedTask && onTaskAction) {
            event.preventDefault();
            await onTaskAction(selectedTask.id, { type: "delegate" });
          }
          break;

        case "t":
          event.preventDefault();
          onStartTimer?.();
          break;

        // Filter toggle
        case "f":
          event.preventDefault();
          onToggleFilters?.();
          break;

        // Help
        case "?":
          event.preventDefault();
          showKeyboardHelp();
          break;

        // Reset/Escape
        case "escape":
          event.preventDefault();
          // Could trigger a reset or close action
          break;
      }
    },
    [
      enabled,
      selectedTask,
      onTaskAction,
      onSelectNext,
      onSelectPrevious,
      onOpenDetails,
      onStartTimer,
      onToggleFilters,
    ]
  );

  useEffect(() => {
    if (enabled) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [handleKeyDown, enabled]);

  return {
    shortcuts: getShortcutList(),
  };
}

function showKeyboardHelp() {
  // Could show a modal or toast with keyboard shortcuts
  console.log("Keyboard shortcuts:", getShortcutList());
}

function getShortcutList() {
  return [
    { key: "j / ↓", description: "Select next task" },
    { key: "k / ↑", description: "Select previous task" },
    { key: "Enter", description: "Open task details" },
    { key: "c", description: "Complete selected task" },
    { key: "d", description: "Defer selected task" },
    { key: "w", description: "Delegate selected task" },
    { key: "t", description: "Start timer for selected task" },
    { key: "f", description: "Toggle filters" },
    { key: "Cmd/Ctrl + f", description: "Focus search" },
    { key: "?", description: "Show this help" },
    { key: "Esc", description: "Reset/Close" },
  ];
}
