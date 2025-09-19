export type TaskStatus = 'captured' | 'next_action' | 'project' | 'waiting_for' | 'someday' | 'completed'
export type ProjectStatus = 'active' | 'complete'
export type ReviewType = 'daily' | 'weekly'
export type TaskContext = 'calls' | 'computer' | 'errands' | 'home' | 'office' | 'anywhere'
export type TaskEnergyLevel = 'high' | 'medium' | 'low'
export type TaskDuration = '5min' | '15min' | '30min' | '1hour' | '2hour+'

export interface Task {
  id: string
  user_id: string
  title: string
  description?: string
  status: TaskStatus
  project_id?: string
  context?: TaskContext
  energy_level?: TaskEnergyLevel
  estimated_duration?: TaskDuration
  due_date?: string
  priority?: number // 1-5, where 1 is highest priority
  tags?: string[]
  notes?: string
  waiting_for?: string // Who or what we're waiting for (when status is 'waiting_for')
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  user_id: string
  name: string
  description?: string
  status: ProjectStatus
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  user_id: string
  type: ReviewType
  completed_at: string
  notes?: string
  duration_minutes?: number
  tasks_reviewed?: number
  projects_reviewed?: number
  progress_data?: ReviewProgressData
  created_at: string
  updated_at: string
}

export interface ReviewProgressData {
  current_step: number
  total_steps: number
  completed_steps: string[]
  started_at: string
  paused_at?: string
  resumed_at?: string
}

export interface ReviewSession {
  id: string
  user_id: string
  type: ReviewType
  status: 'active' | 'paused' | 'completed' | 'abandoned'
  current_step: number
  total_steps: number
  completed_steps: string[]
  session_data: Record<string, unknown>
  started_at: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface ReviewMetrics {
  id: string
  user_id: string
  date: string
  tasks_completed: number
  tasks_created: number
  projects_updated: number
  inbox_items_processed: number
  daily_reviews_completed: number
  weekly_reviews_completed: number
  created_at: string
}

export interface AICoachingPrompt {
  id: string
  step: string
  review_type: ReviewType
  content: string
  conditions?: Record<string, unknown>
  priority: number
}

export interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
}

// For creating new tasks
export type CreateTaskInput = Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>

// For updating tasks
export type UpdateTaskInput = Partial<Omit<Task, 'id' | 'user_id' | 'created_at'>>

// Engagement system types
export interface TaskFilter {
  status?: TaskStatus[]
  context?: TaskContext[]
  energy_level?: TaskEnergyLevel[]
  estimated_duration?: TaskDuration[]
  priority?: number[]
  due_today?: boolean
  overdue?: boolean
  has_project?: boolean
  tags?: string[]
}

export interface EngagementContext {
  current_location?: 'home' | 'office' | 'mobile'
  available_time?: TaskDuration
  current_energy?: TaskEnergyLevel
  available_tools?: string[]
}

export interface TaskSuggestion {
  task: Task
  score: number
  reasons: string[]
}

export interface TaskAction {
  type: 'complete' | 'defer' | 'delegate' | 'update' | 'delete'
  data?: Record<string, unknown>
}

export interface TimerSession {
  id: string
  task_id: string
  user_id: string
  started_at: string
  ended_at?: string
  duration_minutes?: number
  notes?: string
}

// Review-specific types
export type ReviewStepType =
  | 'welcome'
  | 'calendar_check'
  | 'inbox_process'
  | 'task_triage'
  | 'project_review'
  | 'waiting_for_review'
  | 'someday_review'
  | 'planning'
  | 'reflection'
  | 'completion'

export interface ReviewStep {
  id: ReviewStepType
  title: string
  description: string
  timeEstimate: string
  required: boolean
  component: string
}

export interface DailyReviewData {
  todaysTasks: Task[]
  overdueTasks: Task[]
  waitingForItems: Task[]
  calendarEvents?: Record<string, unknown>[]
  completedTasks: Task[]
  tomorrowsPlan: string[]
}

export interface WeeklyReviewData {
  inboxItems: Task[]
  allProjects: Project[]
  somedayItems: Task[]
  completedThisWeek: Task[]
  calendarNextWeek?: Record<string, unknown>[]
  insights: WeeklyInsights
}

export interface WeeklyInsights {
  tasksCompleted: number
  projectsProgressed: number
  avgTasksPerDay: number
  topContexts: string[]
  streakDays: number
}