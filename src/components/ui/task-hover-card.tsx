"use client";

import React from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Clock,
  User,
  Calendar,
  Flag,
  Zap,
  Phone,
  Monitor,
  Car,
  Home,
  Building,
  Globe,
  Edit3,
  ExternalLink,
  CheckCircle2,
  Archive,
} from "lucide-react";
import type {
  Task,
  TaskContext,
  TaskEnergyLevel,
  TaskStatus,
} from "@/types/database";

interface TaskHoverCardProps {
  task: Task;
  children: React.ReactNode;
  onEdit?: (task: Task) => void;
  onComplete?: (taskId: string, completed: boolean) => void;
  disabled?: boolean;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

const contextIcons: Record<TaskContext, React.ElementType> = {
  calls: Phone,
  computer: Monitor,
  errands: Car,
  home: Home,
  office: Building,
  anywhere: Globe,
};

const energyColors: Record<TaskEnergyLevel, string> = {
  high: "text-error",
  medium: "text-warning",
  low: "text-success",
};

const statusLabels: Record<TaskStatus, string> = {
  captured: "Inbox",
  next_action: "Next Action",
  project: "Project",
  waiting_for: "Waiting For",
  someday: "Someday/Maybe",
  completed: "Completed",
};

const statusColors: Record<TaskStatus, string> = {
  captured: "bg-blue-100 text-blue-800",
  next_action: "bg-orange-100 text-orange-800",
  project: "bg-purple-100 text-purple-800",
  waiting_for: "bg-yellow-100 text-yellow-800",
  someday: "bg-gray-100 text-gray-800",
  completed: "bg-green-100 text-green-800",
};

export function TaskHoverCard({
  task,
  children,
  onEdit,
  onComplete,
  disabled = false,
  side = "right",
  align = "start",
}: TaskHoverCardProps) {
  const isCompleted = task.status === "completed" || task.completed_at;
  const isOverdue =
    task.due_date && new Date(task.due_date) < new Date() && !isCompleted;
  const isDueToday =
    task.due_date &&
    new Date(task.due_date).toDateString() === new Date().toDateString();

  const ContextIcon = task.context ? contextIcons[task.context] : null;

  // Don't show hover card on mobile or if disabled
  if (disabled || (typeof window !== "undefined" && window.innerWidth < 768)) {
    return <>{children}</>;
  }

  return (
    <HoverCard openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent
        className="w-96 p-0"
        side={side}
        align={align}
        sideOffset={8}
      >
        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h4
                className={cn(
                  "font-semibold text-base leading-tight",
                  isCompleted && "line-through text-gray-500"
                )}
              >
                {task.title}
              </h4>
              <Badge
                variant="secondary"
                className={cn("text-xs", statusColors[task.status])}
              >
                {statusLabels[task.status]}
              </Badge>
            </div>

            {task.description && (
              <p className="text-sm text-gray-600 leading-relaxed">
                {task.description}
              </p>
            )}
          </div>

          <Separator />

          {/* Metadata */}
          <div className="space-y-2">
            {/* Context */}
            {ContextIcon && (
              <div className="flex items-center gap-2 text-sm">
                <ContextIcon className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">@{task.context}</span>
              </div>
            )}

            {/* Energy level */}
            {task.energy_level && (
              <div className="flex items-center gap-2 text-sm">
                <Zap
                  className={cn("h-4 w-4", energyColors[task.energy_level])}
                />
                <span className="text-gray-600 capitalize">
                  {task.energy_level} energy
                </span>
              </div>
            )}

            {/* Duration */}
            {task.estimated_duration && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">{task.estimated_duration}</span>
              </div>
            )}

            {/* Due date */}
            {task.due_date && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar
                  className={cn(
                    "h-4 w-4",
                    isOverdue
                      ? "text-error"
                      : isDueToday
                        ? "text-warning"
                        : "text-gray-500"
                  )}
                />
                <span
                  className={cn(
                    "text-gray-600",
                    isOverdue && "text-error font-medium",
                    isDueToday && "text-warning font-medium"
                  )}
                >
                  {isDueToday
                    ? "Due today"
                    : isOverdue
                      ? "Overdue"
                      : `Due ${new Date(task.due_date).toLocaleDateString()}`}
                </span>
              </div>
            )}

            {/* Waiting for */}
            {task.waiting_for && (
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-brand-teal" />
                <span className="text-gray-600">
                  Waiting for: {task.waiting_for}
                </span>
              </div>
            )}

            {/* Priority */}
            {task.priority && task.priority <= 2 && (
              <div className="flex items-center gap-2 text-sm">
                <Flag className="h-4 w-4 text-error" />
                <span className="text-error font-medium">High priority</span>
              </div>
            )}

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {task.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Timestamps */}
          <div className="space-y-1 text-xs text-gray-500">
            <div>Created: {new Date(task.created_at).toLocaleDateString()}</div>
            {task.updated_at && task.updated_at !== task.created_at && (
              <div>
                Updated: {new Date(task.updated_at).toLocaleDateString()}
              </div>
            )}
            {task.completed_at && (
              <div>
                Completed: {new Date(task.completed_at).toLocaleDateString()}
              </div>
            )}
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-1">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(task)}
                  className="h-8 px-2 text-xs"
                >
                  <Edit3 className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              )}

              {onComplete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onComplete(task.id, !isCompleted)}
                  className="h-8 px-2 text-xs"
                >
                  {isCompleted ? (
                    <>
                      <Archive className="h-3 w-3 mr-1" />
                      Restore
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Complete
                    </>
                  )}
                </Button>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => {
                // Could open task in full view or navigate to task details
                console.log("Open task details for:", task.id);
              }}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Open
            </Button>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

// Simplified hover card for task lists
interface SimpleTaskHoverCardProps {
  task: Task;
  children: React.ReactNode;
  disabled?: boolean;
}

export function SimpleTaskHoverCard({
  task,
  children,
  disabled = false,
}: SimpleTaskHoverCardProps) {
  // Don't show hover card on mobile or if disabled
  if (disabled || (typeof window !== "undefined" && window.innerWidth < 768)) {
    return <>{children}</>;
  }

  const isOverdue =
    task.due_date && new Date(task.due_date) < new Date() && !task.completed_at;

  return (
    <HoverCard openDelay={500} closeDelay={100}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent className="w-80 p-3" side="right" align="start">
        <div className="space-y-2">
          <h4 className="font-medium text-sm">{task.title}</h4>

          {task.description && (
            <p className="text-xs text-gray-600 line-clamp-3">
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Badge
              variant="secondary"
              className={cn("text-xs", statusColors[task.status])}
            >
              {statusLabels[task.status]}
            </Badge>

            {task.due_date && (
              <span className={cn(isOverdue && "text-error font-medium")}>
                Due {new Date(task.due_date).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
