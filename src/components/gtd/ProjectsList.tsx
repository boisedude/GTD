"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FolderOpen,
  Search,
  Plus,
  RotateCcw,
  Archive,
  Target,
  TrendingUp,
  Clock,
  CheckCircle2,
  BarChart3,
} from "lucide-react";
import { ProjectCard } from "./ProjectCard";
import { useProjects } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";
import { cn } from "@/lib/utils";
import type { Project, Task } from "@/types/database";

interface ProjectsListProps {
  onProjectEdit?: (project: Project) => void;
  onProjectCreate?: () => void;
  onTaskEdit?: (task: Task) => void;
  onTaskCreate?: (projectId?: string) => void;
  className?: string;
}

type ProjectView = "active" | "completed" | "all";

export function ProjectsList({
  onProjectEdit,
  onProjectCreate,
  onTaskEdit,
  onTaskCreate,
  className,
}: ProjectsListProps) {
  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
    updateProject,
    deleteProject,
  } = useProjects();
  const { tasks, loading: tasksLoading, error: tasksError } = useTasks();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedView, setSelectedView] = useState<ProjectView>("active");

  // Group tasks by project
  const tasksByProject = useMemo(() => {
    return tasks.reduce(
      (acc, task) => {
        const projectId = task.project_id || "no-project";
        if (!acc[projectId]) {
          acc[projectId] = [];
        }
        acc[projectId].push(task);
        return acc;
      },
      {} as Record<string, Task[]>
    );
  }, [tasks]);

  // Filter projects based on search and view
  const filteredProjects = useMemo(() => {
    let filtered = projects;

    // Filter by view (active/completed/all)
    if (selectedView === "active") {
      filtered = filtered.filter((project) => project.status === "active");
    } else if (selectedView === "completed") {
      filtered = filtered.filter((project) => project.status === "complete");
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((project) =>
        project.name.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [projects, selectedView, searchQuery]);

  // Calculate project statistics
  const projectStats = useMemo(() => {
    const activeProjects = projects.filter((p) => p.status === "active");
    const completedProjects = projects.filter((p) => p.status === "complete");

    // const totalTasks = Object.values(tasksByProject).flat().length;
    const projectTasks = Object.entries(tasksByProject)
      .filter(([_projectId]) => _projectId !== "no-project")
      .map(([, tasks]) => tasks)
      .flat();

    const completedTasks = projectTasks.filter(
      (task) => task.status === "completed" || task.completed_at
    );

    return {
      total: projects.length,
      active: activeProjects.length,
      completed: completedProjects.length,
      tasksInProjects: projectTasks.length,
      completedTasks: completedTasks.length,
      completionRate:
        projectTasks.length > 0
          ? Math.round((completedTasks.length / projectTasks.length) * 100)
          : 0,
    };
  }, [projects, tasksByProject]);

  const handleProjectComplete = async (
    projectId: string,
    completed: boolean
  ) => {
    await updateProject(projectId, {
      status: completed ? "complete" : "active",
    });
  };

  const handleProjectDelete = async (projectId: string) => {
    const projectTasks = tasksByProject[projectId] || [];
    if (projectTasks.length > 0) {
      alert(
        `Cannot delete project with ${projectTasks.length} tasks. Please reassign or delete tasks first.`
      );
      return;
    }
    await deleteProject(projectId);
  };

  const loading = projectsLoading || tasksLoading;
  const error = projectsError || tasksError;

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Statistics Cards Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-l-4 border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-12" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and View Controls Skeleton */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-64" />
        </div>

        {/* Projects Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
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
        <div className="text-red-600 mb-4">Error loading projects: {error}</div>
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
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FolderOpen className="h-6 w-6 text-purple-600" />
            Projects
          </h2>
          <p className="text-sm text-gray-600">
            Manage your multi-step outcomes and track progress
          </p>
        </div>
        {onProjectCreate && (
          <Button onClick={onProjectCreate}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Projects
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {projectStats.active}
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {projectStats.completed}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Project Tasks
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {projectStats.tasksInProjects}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Completion Rate
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {projectStats.completionRate}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and View Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs
          value={selectedView}
          onValueChange={(value) => setSelectedView(value as ProjectView)}
        >
          <TabsList>
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Active ({projectStats.active})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Completed ({projectStats.completed})
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              All ({projectStats.total})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                {searchQuery ? (
                  <Archive className="h-6 w-6 text-purple-600" />
                ) : (
                  <Plus className="h-6 w-6 text-purple-600" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {searchQuery ? "No projects found" : "No projects yet"}
                </h3>
                <p className="text-gray-600 mt-1">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "Create your first project to organize multi-step outcomes"}
                </p>
              </div>
              {!searchQuery && onProjectCreate && (
                <Button onClick={onProjectCreate} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Project
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              tasks={tasksByProject[project.id] || []}
              onEdit={onProjectEdit}
              onDelete={handleProjectDelete}
              onComplete={handleProjectComplete}
              onAddTask={onTaskCreate}
            />
          ))}
        </div>
      )}

      {/* Orphaned Tasks Section */}
      {tasksByProject["no-project"]?.length > 0 && (
        <Card className="border-l-4 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Clock className="h-5 w-5" />
              Tasks Without Projects
              <Badge
                variant="secondary"
                className="bg-yellow-100 text-yellow-800"
              >
                {tasksByProject["no-project"].length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              These tasks aren&apos;t assigned to any project. Consider
              organizing them into projects or converting them to standalone
              actions.
            </p>
            <div className="space-y-2">
              {tasksByProject["no-project"].slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-2 bg-yellow-50 rounded border border-yellow-200"
                >
                  <span className="text-sm font-medium truncate">
                    {task.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onTaskEdit?.(task)}
                  >
                    Edit
                  </Button>
                </div>
              ))}
              {tasksByProject["no-project"].length > 5 && (
                <p className="text-xs text-gray-500 text-center">
                  +{tasksByProject["no-project"].length - 5} more tasks
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
