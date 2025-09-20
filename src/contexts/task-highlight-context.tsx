"use client";

import { createContext, useContext, ReactNode } from "react";
import type { Task } from "@/types/database";

interface TaskHighlightReason {
  type: "overdue" | "due_today" | "unprocessed" | "high_priority" | "orphaned";
  message: string;
}

interface TaskHighlightContextType {
  shouldHighlight: (task: Task) => boolean;
  getHighlightReasons: (task: Task) => TaskHighlightReason[];
  isInTaskManagementArea: boolean;
}

const TaskHighlightContext = createContext<TaskHighlightContextType | null>(
  null
);

interface TaskHighlightProviderProps {
  children: ReactNode;
  isInTaskManagementArea?: boolean;
}

export function TaskHighlightProvider({
  children,
  isInTaskManagementArea = true,
}: TaskHighlightProviderProps) {
  const shouldHighlight = (task: Task): boolean => {
    // Don't highlight if not in task management area
    if (!isInTaskManagementArea) return false;

    // Don't highlight completed tasks
    if (task.status === "completed" || task.completed_at) return false;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Check highlighting conditions
    const isOverdue = task.due_date && new Date(task.due_date) < today;
    const isDueToday =
      task.due_date &&
      new Date(task.due_date).toDateString() === today.toDateString();
    const isUnprocessed = task.status === "captured";
    const isHighPriorityAction =
      task.priority && task.priority <= 2 && task.status === "next_action";

    return Boolean(
      isOverdue || isDueToday || isUnprocessed || isHighPriorityAction
    );
  };

  const getHighlightReasons = (task: Task): TaskHighlightReason[] => {
    if (!isInTaskManagementArea) return [];

    const reasons: TaskHighlightReason[] = [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Check overdue
    if (
      task.due_date &&
      new Date(task.due_date) < today &&
      task.status !== "completed"
    ) {
      reasons.push({
        type: "overdue",
        message: "This task is overdue and needs attention",
      });
    }

    // Check due today
    if (
      task.due_date &&
      new Date(task.due_date).toDateString() === today.toDateString()
    ) {
      reasons.push({
        type: "due_today",
        message: "This task is due today",
      });
    }

    // Check unprocessed
    if (task.status === "captured") {
      reasons.push({
        type: "unprocessed",
        message: "This task needs to be processed and organized",
      });
    }

    // Check high priority next actions
    if (task.priority && task.priority <= 2 && task.status === "next_action") {
      reasons.push({
        type: "high_priority",
        message: `High priority (P${task.priority}) next action`,
      });
    }

    return reasons;
  };

  const value: TaskHighlightContextType = {
    shouldHighlight,
    getHighlightReasons,
    isInTaskManagementArea,
  };

  return (
    <TaskHighlightContext.Provider value={value}>
      {children}
    </TaskHighlightContext.Provider>
  );
}

export function useTaskHighlight() {
  const context = useContext(TaskHighlightContext);
  if (!context) {
    // Return safe defaults when outside of TaskHighlightProvider
    return {
      shouldHighlight: () => false,
      getHighlightReasons: () => [],
      isInTaskManagementArea: false,
    };
  }
  return context;
}

export type { TaskHighlightReason };
