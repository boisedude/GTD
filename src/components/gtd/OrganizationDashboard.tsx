'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
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
  BookOpen,
  Play
} from 'lucide-react'
import { GTDLists } from './GTDLists'
import { DragDropLists } from './DragDropLists'
import { ProjectsList } from './ProjectsList'
import { TaskEditModal } from './TaskEditModal'
import { ReviewAnalyticsDashboard, ReviewReminder } from '@/components/reviews'
import { useTasks } from '@/hooks/useTasks'
import { useProjects } from '@/hooks/useProjects'
import { useReviews } from '@/hooks/useReviews'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { Task, Project, UpdateTaskInput } from '@/types/database'

interface OrganizationDashboardProps {
  className?: string
}

export function OrganizationDashboard({ className }: OrganizationDashboardProps) {
  const { tasks, updateTask, createTask } = useTasks()
  const { projects, createProject, updateProject } = useProjects()
  const { getReviewStreak, recentReviews, startReview } = useReviews()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)

  // Calculate dashboard statistics
  const stats = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisWeek = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000))

    const tasksByStatus = tasks.reduce((acc, task) => {
      if (!acc[task.status]) acc[task.status] = 0
      acc[task.status]++
      return acc
    }, {} as Record<string, number>)

    const dueTasks = tasks.filter(task => {
      if (!task.due_date) return false
      const dueDate = new Date(task.due_date)
      return dueDate <= today && task.status !== 'completed'
    })

    const overdueTasks = tasks.filter(task => {
      if (!task.due_date) return false
      const dueDate = new Date(task.due_date)
      return dueDate < today && task.status !== 'completed'
    })

    const completedThisWeek = tasks.filter(task => {
      if (!task.completed_at) return false
      const completedDate = new Date(task.completed_at)
      return completedDate >= thisWeek
    })

    const activeProjects = projects.filter(p => p.status === 'active')
    const projectsWithNextActions = activeProjects.filter(project => {
      return tasks.some(task => task.project_id === project.id && task.status === 'next_action')
    })

    return {
      totalTasks: tasks.length,
      captured: tasksByStatus['captured'] || 0,
      nextActions: tasksByStatus['next_action'] || 0,
      projects: tasksByStatus['project'] || 0,
      waitingFor: tasksByStatus['waiting_for'] || 0,
      someday: tasksByStatus['someday'] || 0,
      completed: tasksByStatus['completed'] || 0,
      dueToday: dueTasks.length,
      overdue: overdueTasks.length,
      completedThisWeek: completedThisWeek.length,
      activeProjects: activeProjects.length,
      projectsWithActions: projectsWithNextActions.length,
      projectProgress: activeProjects.length > 0 ? Math.round((projectsWithNextActions.length / activeProjects.length) * 100) : 0
    }
  }, [tasks, projects])

  const handleTaskEdit = (task: Task) => {
    setEditingTask(task)
    setIsTaskModalOpen(true)
  }

  const handleTaskCreate = () => {
    setEditingTask(null)
    setIsTaskModalOpen(true)
  }

  const handleTaskSave = async (taskData: UpdateTaskInput) => {
    if (editingTask) {
      await updateTask(editingTask.id, taskData)
    } else {
      await createTask({
        title: taskData.title!,
        description: taskData.description,
        status: taskData.status || 'captured',
        project_id: taskData.project_id,
        context: taskData.context,
        energy_level: taskData.energy_level,
        estimated_duration: taskData.estimated_duration,
        due_date: taskData.due_date,
        priority: taskData.priority,
        tags: taskData.tags,
        notes: taskData.notes
      })
    }
  }

  const handleCloseModal = () => {
    setIsTaskModalOpen(false)
    setEditingTask(null)
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <LayoutDashboard className="h-8 w-8 text-blue-600" />
            GTD Organization
          </h1>
          <p className="text-gray-600">
            Organize your tasks and projects using Getting Things Done methodology
          </p>
        </div>
        <Button onClick={handleTaskCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="lists" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Lists
          </TabsTrigger>
          <TabsTrigger value="organize" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Organize
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Projects
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Card className="border-l-4 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Captured</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.captured}</p>
                  </div>
                  <Inbox className="h-6 w-6 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Next Actions</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.nextActions}</p>
                  </div>
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Projects</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.activeProjects}</p>
                  </div>
                  <FolderOpen className="h-6 w-6 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Waiting For</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.waitingFor}</p>
                  </div>
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{stats.completedThisWeek}</p>
                  </div>
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-xs text-gray-500 mt-1">This week</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Due/Overdue</p>
                    <p className="text-2xl font-bold text-red-600">{stats.dueToday + stats.overdue}</p>
                  </div>
                  <Calendar className="h-6 w-6 text-red-600" />
                </div>
                <p className="text-xs text-gray-500 mt-1">{stats.overdue} overdue</p>
              </CardContent>
            </Card>
          </div>

          {/* Progress Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  Project Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Projects with Next Actions</span>
                    <Badge variant="secondary">
                      {stats.projectsWithActions} / {stats.activeProjects}
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-purple-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${stats.projectProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    {stats.projectProgress}% of active projects have defined next actions
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Weekly Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tasks completed</span>
                    <span className="font-semibold text-green-600">{stats.completedThisWeek}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Items in inbox</span>
                    <span className="font-semibold text-blue-600">{stats.captured}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Overdue tasks</span>
                    <span className={cn("font-semibold", stats.overdue > 0 ? "text-red-600" : "text-green-600")}>
                      {stats.overdue}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('lists')}
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <Inbox className="h-6 w-6 text-blue-600" />
                  <span className="text-sm">Process Inbox</span>
                  {stats.captured > 0 && (
                    <Badge variant="secondary">{stats.captured}</Badge>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setActiveTab('organize')}
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <Settings className="h-6 w-6 text-orange-600" />
                  <span className="text-sm">Organize Tasks</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setActiveTab('projects')}
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <FolderOpen className="h-6 w-6 text-purple-600" />
                  <span className="text-sm">Review Projects</span>
                  <Badge variant="secondary">{stats.activeProjects}</Badge>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleTaskCreate}
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <Plus className="h-6 w-6 text-green-600" />
                  <span className="text-sm">Add Task</span>
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
  )
}