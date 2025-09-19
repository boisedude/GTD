"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Inbox,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FolderOpen,
  Search,
  Filter,
  Plus,
  RotateCcw,
  Archive,
} from "lucide-react";
import { TaskCard } from "./TaskCard";
import { useTasks } from "@/hooks/useTasks";
import { cn } from "@/lib/utils";
import type { Task, TaskStatus, TaskFilter } from "@/types/database";

interface GTDListsProps {
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
    countColor: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    id: "next_action" as TaskStatus,
    title: "Next Actions",
    description: "Tasks ready to be done",
    icon: AlertTriangle,
    color: "orange",
    borderColor: "border-orange-200",
    iconColor: "text-orange-600",
    countColor: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    id: "project" as TaskStatus,
    title: "Projects",
    description: "Multi-step outcomes",
    icon: FolderOpen,
    color: "purple",
    borderColor: "border-purple-200",
    iconColor: "text-purple-600",
    countColor: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    id: "waiting_for" as TaskStatus,
    title: "Waiting For",
    description: "Delegated or pending items",
    icon: Clock,
    color: "yellow",
    borderColor: "border-yellow-200",
    iconColor: "text-yellow-600",
    countColor: "text-yellow-600",
    bgColor: "bg-yellow-50",
  },
  {
    id: "someday" as TaskStatus,
    title: "Someday/Maybe",
    description: "Future possibilities",
    icon: CheckCircle2,
    color: "gray",
    borderColor: "border-gray-200",
    iconColor: "text-gray-600",
    countColor: "text-gray-600",
    bgColor: "bg-gray-50",
  },
] as const;

export function GTDLists({
  onTaskEdit,
  onTaskCreate,
  className,
}: GTDListsProps) {
  const { tasks, loading, error, updateTask, deleteTask } = useTasks();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedList, setSelectedList] = useState<TaskStatus | "all">("all");
  const [filters, setFilters] = useState<TaskFilter>({});
  const [showFilters, setShowFilters] = useState(false);

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    return tasks.reduce(
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
  }, [tasks]);

  // Filter tasks based on search and filters
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query) ||
          task.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Filter by selected list
    if (selectedList !== "all") {
      filtered = filtered.filter((task) => task.status === selectedList);
    }

    // Apply additional filters
    if (filters.context?.length) {
      filtered = filtered.filter(
        (task) => task.context && filters.context!.includes(task.context)
      );
    }

    if (filters.energy_level?.length) {
      filtered = filtered.filter(
        (task) =>
          task.energy_level && filters.energy_level!.includes(task.energy_level)
      );
    }

    if (filters.due_today) {
      const today = new Date().toDateString();
      filtered = filtered.filter(
        (task) =>
          task.due_date && new Date(task.due_date).toDateString() === today
      );
    }

    if (filters.overdue) {
      const now = new Date();
      filtered = filtered.filter(
        (task) => task.due_date && new Date(task.due_date) < now
      );
    }

    return filtered;
  }, [tasks, searchQuery, selectedList, filters]);

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
      <div className={cn("space-y-6", className)}>
        {/* Header Skeleton */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-72" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Controls Skeleton */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        {/* GTD Lists Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="min-h-[400px]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-6 w-6 rounded" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="h-6 w-8" />
                </div>
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-4 w-full mb-2" />
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                          <Skeleton className="h-5 w-12" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                        <Skeleton className="h-6 w-6" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
      {/* Header with search and filters */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">GTD Lists</h2>
          {onTaskCreate && (
            <Button onClick={onTaskCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          )}
        </div>

        {/* Search and filters bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tasks, descriptions, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Select
              value={selectedList}
              onValueChange={(value) =>
                setSelectedList(value as TaskStatus | "all")
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All lists" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Lists</SelectItem>
                {GTD_LISTS.map((list) => (
                  <SelectItem key={list.id} value={list.id}>
                    {list.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(showFilters && "bg-muted")}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <Card className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Context
                </label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Any context" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="calls">@calls</SelectItem>
                    <SelectItem value="computer">@computer</SelectItem>
                    <SelectItem value="errands">@errands</SelectItem>
                    <SelectItem value="home">@home</SelectItem>
                    <SelectItem value="office">@office</SelectItem>
                    <SelectItem value="anywhere">@anywhere</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Energy</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Any energy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      due_today: !prev.due_today,
                    }))
                  }
                  className={cn(filters.due_today && "bg-muted")}
                >
                  Due Today
                </Button>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, overdue: !prev.overdue }))
                  }
                  className={cn(filters.overdue && "bg-muted")}
                >
                  Overdue
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* GTD Lists Overview */}
      {selectedList === "all" && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {GTD_LISTS.map((list) => {
            const count = tasksByStatus[list.id]?.length || 0;
            const Icon = list.icon;

            return (
              <Card
                key={list.id}
                className={cn(
                  "hover:shadow-md transition-shadow cursor-pointer border-l-4",
                  list.borderColor
                )}
                onClick={() => setSelectedList(list.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center">
                      <Icon className={cn("h-4 w-4 mr-2", list.iconColor)} />
                      {list.title}
                    </CardTitle>
                    <span className={cn("text-xl font-bold", list.countColor)}>
                      {count}
                    </span>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      )}

      {/* Task Lists */}
      {selectedList === "all" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {GTD_LISTS.map((list) => {
            const listTasks = tasksByStatus[list.id] || [];
            if (listTasks.length === 0 && searchQuery === "") return null;

            const Icon = list.icon;

            return (
              <Card key={list.id} className="h-fit">
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
                </CardHeader>
                <CardContent className="space-y-3">
                  {listTasks.length === 0 ? (
                    <p className="text-sm text-gray-500 italic py-4 text-center">
                      No tasks in {list.title.toLowerCase()}
                    </p>
                  ) : (
                    listTasks
                      .slice(0, 5)
                      .map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onEdit={onTaskEdit}
                          onDelete={handleTaskDelete}
                          onComplete={handleTaskComplete}
                          onStatusChange={handleTaskStatusChange}
                          compact
                        />
                      ))
                  )}

                  {listTasks.length > 5 && (
                    <Button
                      variant="ghost"
                      className="w-full text-sm"
                      onClick={() => setSelectedList(list.id)}
                    >
                      View all {listTasks.length} tasks
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Single list view */
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="space-y-4">
                  <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <Archive className="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      No tasks found
                    </h3>
                    <p className="text-gray-600 mt-1">
                      {searchQuery
                        ? "Try adjusting your search or filters"
                        : "This list is empty"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onTaskEdit}
                onDelete={handleTaskDelete}
                onComplete={handleTaskComplete}
                onStatusChange={handleTaskStatusChange}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
