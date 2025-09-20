"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTaskHighlight } from "@/contexts/task-highlight-context";
import { DeleteConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Clock,
  User,
  Calendar,
  MoreHorizontal,
  CheckCircle2,
  Circle,
  Edit3,
  Trash2,
  Flag,
  Zap,
  Phone,
  Monitor,
  Car,
  Home,
  Building,
  Globe,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type {
  Task,
  TaskStatus,
  TaskContext,
  TaskEnergyLevel,
} from "@/types/database";

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onComplete?: (taskId: string, completed: boolean) => void;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  onDragStart?: (task: Task) => void;
  compact?: boolean;
  className?: string;
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

const priorityColors = {
  1: "border-l-error bg-error/5",
  2: "border-l-warning bg-warning/5",
  3: "border-l-warning bg-warning/5",
  4: "border-l-brand-teal bg-brand-teal/5",
  5: "border-l-brand-gray-400 bg-brand-gray-50",
};

export function TaskCard({
  task,
  onEdit,
  onDelete,
  onComplete,
  onStatusChange,
  onDragStart,
  compact = false,
  className,
}: TaskCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { shouldHighlight } = useTaskHighlight();

  const isCompleted = task.status === "completed" || task.completed_at;
  const isOverdue =
    task.due_date && new Date(task.due_date) < new Date() && !isCompleted;
  const isDueToday =
    task.due_date &&
    new Date(task.due_date).toDateString() === new Date().toDateString();

  const handleComplete = async () => {
    if (!onComplete) return;

    setIsCompleting(true);
    try {
      await onComplete(task.id, !isCompleted);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleStatusChange = (newStatus: TaskStatus) => {
    if (onStatusChange) {
      onStatusChange(task.id, newStatus);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(task.id);
      setDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const ContextIcon = task.context ? contextIcons[task.context] : null;

  return (
    <Card
      className={cn(
        "group transition-all duration-300 hover:shadow-lg hover:shadow-brand-teal/10 hover:-translate-y-1 cursor-pointer border-l-4 relative min-h-[44px] touch-manipulation",
        "hover:border-brand-teal/30 focus-within:ring-2 focus-within:ring-brand-teal/20",
        task.priority &&
          priorityColors[task.priority as keyof typeof priorityColors],
        isCompleted && "opacity-60 hover:opacity-80",
        isOverdue && "ring-2 ring-error/30 animate-pulse",
        shouldHighlight(task) &&
          "ring-2 ring-yellow-400/50 shadow-lg shadow-yellow-400/20",
        className
      )}
      draggable={!!onDragStart}
      onDragStart={() => onDragStart?.(task)}
    >
      {shouldHighlight(task) && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="bg-yellow-400 text-yellow-900 rounded-full p-1 shadow-lg">
            <div className="w-2 h-2 rounded-full bg-yellow-900"></div>
          </div>
        </div>
      )}
      <CardContent
        className={cn(
          "p-4",
          compact && "p-3",
          "min-h-[44px] touch-manipulation"
        )}
      >
        <div className="flex items-start gap-3">
          {/* Completion checkbox */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 mt-0.5 hover:bg-transparent transition-all duration-200 hover:scale-110 min-h-[44px] min-w-[44px] touch-manipulation"
            onClick={handleComplete}
            disabled={isCompleting}
          >
            {isCompleting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-teal" />
            ) : isCompleted ? (
              <CheckCircle2 className="h-5 w-5 text-success transition-all duration-200 scale-110" />
            ) : (
              <Circle className="h-5 w-5 text-brand-gray-400 hover:text-brand-teal transition-all duration-200" />
            )}
          </Button>

          {/* Task content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3
                  className={cn(
                    "font-medium text-brand-navy mb-1",
                    isCompleted && "line-through text-brand-gray-500",
                    compact ? "text-brand-sm" : "text-brand-base"
                  )}
                >
                  {task.title}
                </h3>

                {task.description && !compact && (
                  <p className="text-brand-sm text-brand-gray-600 mb-2 line-clamp-2">
                    {task.description}
                  </p>
                )}

                {/* Tags and metadata */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {/* Context */}
                  {ContextIcon && (
                    <div className="flex items-center gap-1 text-brand-gray-500">
                      <ContextIcon className="h-3 w-3" />
                      <span>@{task.context}</span>
                    </div>
                  )}

                  {/* Energy level */}
                  {task.energy_level && (
                    <div
                      className={cn(
                        "flex items-center gap-1",
                        energyColors[task.energy_level]
                      )}
                    >
                      <Zap className="h-3 w-3" />
                      <span>{task.energy_level}</span>
                    </div>
                  )}

                  {/* Duration */}
                  {task.estimated_duration && (
                    <div className="flex items-center gap-1 text-brand-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{task.estimated_duration}</span>
                    </div>
                  )}

                  {/* Due date */}
                  {task.due_date && (
                    <div
                      className={cn(
                        "flex items-center gap-1",
                        isOverdue
                          ? "text-error"
                          : isDueToday
                            ? "text-warning"
                            : "text-brand-gray-500"
                      )}
                    >
                      <Calendar className="h-3 w-3" />
                      <span>
                        {isDueToday
                          ? "Today"
                          : isOverdue
                            ? "Overdue"
                            : new Date(task.due_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {/* Waiting for */}
                  {task.waiting_for && (
                    <div className="flex items-center gap-1 text-brand-teal">
                      <User className="h-3 w-3" />
                      <span>Waiting: {task.waiting_for}</span>
                    </div>
                  )}

                  {/* Priority flag */}
                  {task.priority && task.priority <= 2 && (
                    <div className="flex items-center gap-1 text-error">
                      <Flag className="h-3 w-3" />
                      <span>High</span>
                    </div>
                  )}

                  {/* Custom tags */}
                  {task.tags?.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Actions menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-0 md:group-hover:opacity-100 lg:opacity-0 lg:group-hover:opacity-100 opacity-100 sm:opacity-0 transition-all duration-200 hover:bg-brand-gray-100 hover:scale-110 min-h-[44px] min-w-[44px] touch-manipulation"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(task)}>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Task
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem onClick={handleComplete}>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {isCompleted ? "Mark Incomplete" : "Mark Complete"}
                  </DropdownMenuItem>

                  {onStatusChange && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleStatusChange("next_action")}
                      >
                        Move to Next Actions
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusChange("waiting_for")}
                      >
                        Move to Waiting For
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusChange("someday")}
                      >
                        Move to Someday/Maybe
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusChange("project")}
                      >
                        Convert to Project
                      </DropdownMenuItem>
                    </>
                  )}

                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteDialogOpen(true)}
                        className="text-error focus:text-error"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Delete confirmation dialog */}
      <DeleteConfirmDialog
        itemName={task.title}
        itemType="task"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      >
        <span />{" "}
        {/* This span is required but won't be rendered since we control open state */}
      </DeleteConfirmDialog>
    </Card>
  );
}
