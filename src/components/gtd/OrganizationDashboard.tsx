"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LayoutDashboard,
  List,
  FolderOpen,
  BarChart3,
  Settings,
  Plus,
  Target,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Inbox,
  // BookOpen,
  // Play,
} from "lucide-react";
import { GTDLists } from "./GTDLists";
import { DragDropLists } from "./DragDropLists";
import { ProjectsList } from "./ProjectsList";
import { TaskEditModal } from "./TaskEditModal";
// import { ReviewAnalyticsDashboard, ReviewReminder } from "@/components/reviews";
import { useTasks } from "@/hooks/useTasks";
import { useProjects } from "@/hooks/useProjects";
import { useReviews } from "@/hooks/useReviews";
import { cn } from "@/lib/utils";
import type { Task, UpdateTaskInput } from "@/types/database";

interface OrganizationDashboardProps {
  className?: string;
}

export function OrganizationDashboard({
  className,
}: OrganizationDashboardProps) {
  const { tasks, updateTask, createTask } = useTasks();
  const { projects } = useProjects();
  const {} = useReviews();
  // const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Calculate dashboard statistics
  const stats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(
      today.getTime() - today.getDay() * 24 * 60 * 60 * 1000
    );

    const tasksByStatus = tasks.reduce(
      (acc, task) => {
        if (!acc[task.status]) acc[task.status] = 0;
        acc[task.status]++;
        return acc;
      },
      {} as Record<string, number>
    );

    const dueTasks = tasks.filter((task) => {
      if (!task.due_date) return false;
      const dueDate = new Date(task.due_date);
      return dueDate <= today && task.status !== "completed";
    });

    const overdueTasks = tasks.filter((task) => {
      if (!task.due_date) return false;
      const dueDate = new Date(task.due_date);
      return dueDate < today && task.status !== "completed";
    });

    const completedThisWeek = tasks.filter((task) => {
      if (!task.completed_at) return false;
      const completedDate = new Date(task.completed_at);
      return completedDate >= thisWeek;
    });

    const activeProjects = projects.filter((p) => p.status === "active");
    const projectsWithNextActions = activeProjects.filter((project) => {
      return tasks.some(
        (task) =>
          task.project_id === project.id && task.status === "next_action"
      );
    });

    return {
      totalTasks: tasks.length,
      captured: tasksByStatus["captured"] || 0,
      nextActions: tasksByStatus["next_action"] || 0,
      projects: tasksByStatus["project"] || 0,
      waitingFor: tasksByStatus["waiting_for"] || 0,
      someday: tasksByStatus["someday"] || 0,
      completed: tasksByStatus["completed"] || 0,
      dueToday: dueTasks.length,
      overdue: overdueTasks.length,
      completedThisWeek: completedThisWeek.length,
      activeProjects: activeProjects.length,
      projectsWithActions: projectsWithNextActions.length,
      projectProgress:
        activeProjects.length > 0
          ? Math.round(
              (projectsWithNextActions.length / activeProjects.length) * 100
            )
          : 0,
    };
  }, [tasks, projects]);

  const handleTaskEdit = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleTaskCreate = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleTaskSave = async (taskData: UpdateTaskInput) => {
    if (editingTask) {
      await updateTask(editingTask.id, taskData);
    } else {
      await createTask({
        title: taskData.title!,
        description: taskData.description,
        status: taskData.status || "captured",
        project_id: taskData.project_id,
        context: taskData.context,
        energy_level: taskData.energy_level,
        estimated_duration: taskData.estimated_duration,
        due_date: taskData.due_date,
        priority: taskData.priority,
        tags: taskData.tags,
        notes: taskData.notes,
      });
    }
  };

  const handleCloseModal = () => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header - Mobile optimized */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl lg:text-brand-3xl font-bold text-brand-navy flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-brand-teal/10 rounded-lg">
              <LayoutDashboard className="h-6 w-6 sm:h-8 sm:w-8 text-brand-teal" />
            </div>
            <span className="leading-tight">GTD Organization</span>
          </h1>
          <p className="text-sm sm:text-base text-brand-gray-600 leading-relaxed">
            Organize your tasks and projects using Getting Things Done
            methodology
          </p>
        </div>
        <div className="flex items-center gap-2 sm:justify-end">
          <Button
            onClick={handleTaskCreate}
            size="touch"
            className="flex items-center justify-center gap-2 bg-brand-teal hover:bg-brand-teal/90 shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 min-h-[44px] px-4 w-full sm:w-auto"
          >
            <Plus className="h-5 w-5 sm:h-4 sm:w-4" />
            <span className="text-sm font-medium">Add Task</span>
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 bg-brand-gray-100/50 p-1 backdrop-blur-sm min-h-[48px] sm:min-h-[40px]">
          <TabsTrigger
            value="overview"
            className="flex items-center justify-center gap-1 sm:gap-2 transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-brand-navy min-h-[40px] px-2 text-xs sm:text-sm active:scale-95"
          >
            <BarChart3 className="h-4 w-4 flex-shrink-0" />
            <span className="truncate sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger
            value="lists"
            className="flex items-center justify-center gap-1 sm:gap-2 transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-brand-navy min-h-[40px] px-2 text-xs sm:text-sm active:scale-95"
          >
            <List className="h-4 w-4 flex-shrink-0" />
            <span className="truncate sm:inline">Lists</span>
          </TabsTrigger>
          <TabsTrigger
            value="organize"
            className="flex items-center justify-center gap-1 sm:gap-2 transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-brand-navy min-h-[40px] px-2 text-xs sm:text-sm active:scale-95"
          >
            <Settings className="h-4 w-4 flex-shrink-0" />
            <span className="truncate sm:inline">Organize</span>
          </TabsTrigger>
          <TabsTrigger
            value="projects"
            className="flex items-center justify-center gap-1 sm:gap-2 transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-brand-navy min-h-[40px] px-2 text-xs sm:text-sm active:scale-95"
          >
            <FolderOpen className="h-4 w-4 flex-shrink-0" />
            <span className="truncate sm:inline">Projects</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Stats - Mobile optimized grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <Card className="border-l-4 border-brand-teal/30 bg-brand-teal/5 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer group active:scale-95">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs sm:text-brand-sm font-medium text-brand-gray-600 truncate">
                      Captured
                    </p>
                    <p className="text-lg sm:text-brand-2xl font-bold text-brand-teal transition-all duration-200 group-hover:scale-110 leading-tight">
                      {stats.captured}
                    </p>
                  </div>
                  <div className="p-1.5 sm:p-2 bg-brand-teal/10 rounded-lg group-hover:bg-brand-teal/20 transition-all duration-200 flex-shrink-0">
                    <Inbox className="h-4 w-4 sm:h-6 sm:w-6 text-brand-teal" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-warning/30 bg-warning/5 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-sm font-medium text-brand-gray-600">
                      Next Actions
                    </p>
                    <p className="text-brand-2xl font-bold text-warning transition-all duration-200 group-hover:scale-110">
                      {stats.nextActions}
                    </p>
                  </div>
                  <div className="p-2 bg-warning/10 rounded-lg group-hover:bg-warning/20 transition-all duration-200">
                    <AlertTriangle className="h-6 w-6 text-warning" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-brand-navy/30 bg-brand-navy/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-sm font-medium text-brand-gray-600">
                      Projects
                    </p>
                    <p className="text-brand-2xl font-bold text-brand-navy">
                      {stats.activeProjects}
                    </p>
                  </div>
                  <FolderOpen className="h-6 w-6 text-brand-navy" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-brand-gray-400/30 bg-brand-gray-100/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-sm font-medium text-brand-gray-600">
                      Waiting For
                    </p>
                    <p className="text-brand-2xl font-bold text-brand-gray-700">
                      {stats.waitingFor}
                    </p>
                  </div>
                  <Clock className="h-6 w-6 text-brand-gray-700" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-success/30 bg-success/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-sm font-medium text-brand-gray-600">
                      Completed
                    </p>
                    <p className="text-brand-2xl font-bold text-success">
                      {stats.completedThisWeek}
                    </p>
                  </div>
                  <CheckCircle2 className="h-6 w-6 text-success" />
                </div>
                <p className="text-brand-xs text-brand-gray-500 mt-1">
                  This week
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-error/30 bg-error/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-sm font-medium text-brand-gray-600">
                      Due/Overdue
                    </p>
                    <p className="text-brand-2xl font-bold text-error">
                      {stats.dueToday + stats.overdue}
                    </p>
                  </div>
                  <Calendar className="h-6 w-6 text-error" />
                </div>
                <p className="text-brand-xs text-brand-gray-500 mt-1">
                  {stats.overdue} overdue
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Progress Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-brand-navy" />
                  Project Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-brand-sm text-brand-gray-600">
                      Projects with Next Actions
                    </span>
                    <Badge variant="secondary">
                      {stats.projectsWithActions} / {stats.activeProjects}
                    </Badge>
                  </div>
                  <div className="w-full bg-brand-gray-200 rounded-full h-3">
                    <div
                      className="bg-brand-navy h-3 rounded-full transition-all duration-300"
                      style={{ width: `${stats.projectProgress}%` }}
                    />
                  </div>
                  <p className="text-brand-sm text-brand-gray-600">
                    {stats.projectProgress}% of active projects have defined
                    next actions
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-success" />
                  Weekly Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-brand-sm text-brand-gray-600">
                      Tasks completed
                    </span>
                    <span className="font-semibold text-success">
                      {stats.completedThisWeek}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-brand-sm text-brand-gray-600">
                      Items in inbox
                    </span>
                    <span className="font-semibold text-brand-teal">
                      {stats.captured}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-brand-sm text-brand-gray-600">
                      Overdue tasks
                    </span>
                    <span
                      className={cn(
                        "font-semibold",
                        stats.overdue > 0 ? "text-error" : "text-success"
                      )}
                    >
                      {stats.overdue}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions - Mobile optimized */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-lg sm:text-xl">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("lists")}
                  className="h-auto min-h-[60px] sm:min-h-[80px] p-3 sm:p-4 flex flex-col items-center gap-1 sm:gap-2 hover:bg-brand-teal/5 transition-colors duration-200 active:scale-95"
                >
                  <Inbox className="h-5 w-5 sm:h-6 sm:w-6 text-brand-teal flex-shrink-0" />
                  <span className="text-xs sm:text-brand-sm font-medium text-center leading-tight">
                    Process Inbox
                  </span>
                  {stats.captured > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {stats.captured}
                    </Badge>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setActiveTab("organize")}
                  className="h-auto min-h-[60px] sm:min-h-[80px] p-3 sm:p-4 flex flex-col items-center gap-1 sm:gap-2 hover:bg-warning/5 transition-colors duration-200 active:scale-95"
                >
                  <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-warning flex-shrink-0" />
                  <span className="text-xs sm:text-brand-sm font-medium text-center leading-tight">
                    Organize Tasks
                  </span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setActiveTab("projects")}
                  className="h-auto min-h-[60px] sm:min-h-[80px] p-3 sm:p-4 flex flex-col items-center gap-1 sm:gap-2 hover:bg-brand-navy/5 transition-colors duration-200 active:scale-95"
                >
                  <FolderOpen className="h-5 w-5 sm:h-6 sm:w-6 text-brand-navy flex-shrink-0" />
                  <span className="text-xs sm:text-brand-sm font-medium text-center leading-tight">
                    Review Projects
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {stats.activeProjects}
                  </Badge>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleTaskCreate}
                  className="h-auto min-h-[60px] sm:min-h-[80px] p-3 sm:p-4 flex flex-col items-center gap-1 sm:gap-2 hover:bg-success/5 transition-colors duration-200 active:scale-95"
                >
                  <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-success flex-shrink-0" />
                  <span className="text-xs sm:text-brand-sm font-medium text-center leading-tight">
                    Add Task
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lists Tab */}
        <TabsContent value="lists">
          <GTDLists
            onTaskEdit={handleTaskEdit}
            onTaskCreate={handleTaskCreate}
          />
        </TabsContent>

        {/* Organize Tab */}
        <TabsContent value="organize">
          <DragDropLists
            onTaskEdit={handleTaskEdit}
            onTaskCreate={handleTaskCreate}
          />
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects">
          <ProjectsList
            onTaskEdit={handleTaskEdit}
            onTaskCreate={handleTaskCreate}
          />
        </TabsContent>
      </Tabs>

      {/* Task Edit Modal */}
      <TaskEditModal
        task={editingTask || undefined}
        isOpen={isTaskModalOpen}
        onClose={handleCloseModal}
        onSave={handleTaskSave}
      />
    </div>
  );
}
