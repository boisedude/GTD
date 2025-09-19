"use client";

import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Inbox,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FolderOpen,
  Plus,
  RotateCcw,
} from "lucide-react";
import { TaskCard } from "./TaskCard";
import { useTasks } from "@/hooks/useTasks";
import { cn } from "@/lib/utils";
import type { Task, TaskStatus } from "@/types/database";

interface DragDropListsProps {
  onTaskEdit?: (task: Task) => void;
  onTaskCreate?: () => void;
  className?: string;
}

const GTD_LISTS = [
  {
    id: "captured" as TaskStatus,
    title: "Inbox",
    description: "Items to clarify and organize",
    icon: Inbox,
    color: "blue",
    borderColor: "border-blue-200",
    iconColor: "text-blue-600",
    bgColor: "bg-blue-50",
    dropZoneColor: "border-blue-400 bg-blue-100",
  },
  {
    id: "next_action" as TaskStatus,
    title: "Next Actions",
    description: "Tasks ready to be done",
    icon: AlertTriangle,
    color: "orange",
    borderColor: "border-orange-200",
    iconColor: "text-orange-600",
    bgColor: "bg-orange-50",
    dropZoneColor: "border-orange-400 bg-orange-100",
  },
  {
    id: "project" as TaskStatus,
    title: "Projects",
    description: "Multi-step outcomes",
    icon: FolderOpen,
    color: "purple",
    borderColor: "border-purple-200",
    iconColor: "text-purple-600",
    bgColor: "bg-purple-50",
    dropZoneColor: "border-purple-400 bg-purple-100",
  },
  {
    id: "waiting_for" as TaskStatus,
    title: "Waiting For",
    description: "Delegated or pending items",
    icon: Clock,
    color: "yellow",
    borderColor: "border-yellow-200",
    iconColor: "text-yellow-600",
    bgColor: "bg-yellow-50",
    dropZoneColor: "border-yellow-400 bg-yellow-100",
  },
  {
    id: "someday" as TaskStatus,
    title: "Someday/Maybe",
    description: "Future possibilities",
    icon: CheckCircle2,
    color: "gray",
    borderColor: "border-gray-200",
    iconColor: "text-gray-600",
    bgColor: "bg-gray-50",
    dropZoneColor: "border-gray-400 bg-gray-100",
  },
] as const;

export function DragDropLists({
  onTaskEdit,
  onTaskCreate,
  className,
}: DragDropListsProps) {
  const { tasks, loading, error, updateTask, deleteTask } = useTasks();
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverList, setDragOverList] = useState<TaskStatus | null>(null);

  // Group tasks by status
  const tasksByStatus = tasks.reduce(
    (acc, task) => {
      const status = task.status;
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(task);
      return acc;
    },
    {} as Record<TaskStatus, Task[]>
  );

  const handleDragStart = useCallback((task: Task) => {
    setDraggedTask(task);
  }, []);

  const _handleDragEnd = useCallback(() => {
    setDraggedTask(null);
    setDragOverList(null);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, listId: TaskStatus) => {
      e.preventDefault();
      setDragOverList(listId);
    },
    []
  );

  const handleDragLeave = useCallback(() => {
    setDragOverList(null);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent, targetStatus: TaskStatus) => {
      e.preventDefault();

      if (!draggedTask || draggedTask.status === targetStatus) {
        setDraggedTask(null);
        setDragOverList(null);
        return;
      }

      try {
        await updateTask(draggedTask.id, { status: targetStatus });
      } catch (error) {
        console.error("Error moving task:", error);
      } finally {
        setDraggedTask(null);
        setDragOverList(null);
      }
    },
    [draggedTask, updateTask]
  );

  const handleTaskComplete = async (taskId: string, completed: boolean) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    await updateTask(taskId, {
      status: completed ? "completed" : task.status,
      completed_at: completed ? new Date().toISOString() : undefined,
    });
  };

  const handleTaskStatusChange = async (taskId: string, status: TaskStatus) => {
    await updateTask(taskId, { status });
  };

  const handleTaskDelete = async (taskId: string) => {
    await deleteTask(taskId);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your GTD lists...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Error loading tasks: {error}</div>
        <Button onClick={() => window.location.reload()}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-gray-900">GTD Lists</h2>
          <p className="text-sm text-gray-600">
            Drag tasks between lists to organize them.{" "}
            {draggedTask && "✨ Dragging mode active"}
          </p>
        </div>
        {onTaskCreate && (
          <Button onClick={onTaskCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        )}
      </div>

      {/* Drag and Drop Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-6">
        {GTD_LISTS.map((list) => {
          const listTasks = tasksByStatus[list.id] || [];
          const Icon = list.icon;
          const isDropTarget = dragOverList === list.id;
          const isDraggedFromHere =
            draggedTask && draggedTask.status === list.id;

          return (
            <Card
              key={list.id}
              className={cn(
                "h-fit transition-all duration-200",
                list.borderColor,
                isDropTarget && "ring-2 ring-blue-400 shadow-lg",
                isDraggedFromHere && "opacity-75"
              )}
              onDragOver={(e) => handleDragOver(e, list.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, list.id)}
            >
              <CardHeader className="pb-3">
                <CardTitle
                  className={cn(
                    "flex items-center gap-2 text-lg",
                    list.iconColor
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {list.title}
                  <Badge variant="secondary" className="ml-auto">
                    {listTasks.length}
                  </Badge>
                </CardTitle>
                <p className="text-sm text-gray-600">{list.description}</p>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Drop zone indicator */}
                {isDropTarget && draggedTask && (
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-lg p-4 text-center transition-all",
                      list.dropZoneColor
                    )}
                  >
                    <div className={cn("font-medium", list.iconColor)}>
                      Drop task here
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Move &quot;{draggedTask.title}&quot; to {list.title}
                    </div>
                  </div>
                )}

                {/* Tasks */}
                {listTasks.length === 0 && !isDropTarget ? (
                  <div
                    className={cn(
                      "text-center py-8 border-2 border-dashed rounded-lg transition-all",
                      "border-gray-200 text-gray-500",
                      draggedTask &&
                        draggedTask.status !== list.id &&
                        "border-gray-300 bg-gray-50"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-8 w-8 mx-auto mb-2 opacity-50",
                        list.iconColor
                      )}
                    />
                    <p className="text-sm">
                      No tasks in {list.title.toLowerCase()}
                    </p>
                    {draggedTask && draggedTask.status !== list.id && (
                      <p className="text-xs mt-1">
                        Drop tasks here to organize them
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {listTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onEdit={onTaskEdit}
                        onDelete={handleTaskDelete}
                        onComplete={handleTaskComplete}
                        onStatusChange={handleTaskStatusChange}
                        onDragStart={handleDragStart}
                        compact
                        className={cn(
                          "transition-all duration-200",
                          draggedTask?.id === task.id && "opacity-50 scale-95"
                        )}
                      />
                    ))}
                  </div>
                )}

                {/* Quick add button for empty lists */}
                {listTasks.length === 0 &&
                  onTaskCreate &&
                  list.id !== "captured" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-2"
                      onClick={onTaskCreate}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add {list.title.slice(0, -1)}
                    </Button>
                  )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Drag instructions */}
      {tasks.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-blue-900">
                  GTD Organization Tips
                </h3>
                <p className="text-blue-700 text-sm mt-1">
                  Drag tasks between lists to organize them according to GTD
                  principles. Move captured items to Next Actions when
                  they&apos;re clarified, or to Projects if they require
                  multiple steps.
                </p>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-blue-600">
                  <div>
                    📥 <strong>Inbox:</strong> New captures to process
                  </div>
                  <div>
                    ⚡ <strong>Next Actions:</strong> Ready to do now
                  </div>
                  <div>
                    📁 <strong>Projects:</strong> Multi-step outcomes
                  </div>
                  <div>
                    ⏳ <strong>Waiting For:</strong> Waiting on others
                  </div>
                  <div>
                    💭 <strong>Someday:</strong> Future possibilities
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
