import type {
  Task,
  Project,
  Review,
  User,
  TaskStatus,
  ProjectStatus,
  ReviewType,
  TaskContext,
  TaskEnergyLevel,
  TaskDuration
} from '@/types/database'

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'test@example.com',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-2',
    email: 'test2@example.com',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
]

// Mock Tasks
export const mockTasks: Task[] = [
  {
    id: 'task-1',
    user_id: 'user-1',
    title: 'Review quarterly goals',
    description: 'Go through Q4 objectives and assess progress',
    status: 'captured' as TaskStatus,
    context: 'computer' as TaskContext,
    energy_level: 'medium' as TaskEnergyLevel,
    estimated_duration: '30min' as TaskDuration,
    priority: 2,
    tags: ['planning', 'quarterly'],
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  },
  {
    id: 'task-2',
    user_id: 'user-1',
    title: 'Call dentist for appointment',
    description: 'Schedule routine cleaning',
    status: 'next_action' as TaskStatus,
    context: 'calls' as TaskContext,
    energy_level: 'low' as TaskEnergyLevel,
    estimated_duration: '5min' as TaskDuration,
    priority: 3,
    tags: ['health'],
    created_at: '2024-01-02T09:00:00Z',
    updated_at: '2024-01-02T09:00:00Z',
  },
  {
    id: 'task-3',
    user_id: 'user-1',
    title: 'Write project proposal',
    description: 'Draft initial proposal for new client project',
    status: 'project' as TaskStatus,
    project_id: 'project-1',
    context: 'computer' as TaskContext,
    energy_level: 'high' as TaskEnergyLevel,
    estimated_duration: '2hour+' as TaskDuration,
    priority: 1,
    tags: ['work', 'writing'],
    due_date: '2024-01-15T00:00:00Z',
    created_at: '2024-01-03T08:00:00Z',
    updated_at: '2024-01-03T08:00:00Z',
  },
  {
    id: 'task-4',
    user_id: 'user-1',
    title: 'Wait for feedback from manager',
    description: 'Pending approval on budget proposal',
    status: 'waiting_for' as TaskStatus,
    waiting_for: 'Manager approval',
    context: 'anywhere' as TaskContext,
    energy_level: 'low' as TaskEnergyLevel,
    estimated_duration: '5min' as TaskDuration,
    priority: 2,
    tags: ['work'],
    created_at: '2024-01-04T14:00:00Z',
    updated_at: '2024-01-04T14:00:00Z',
  },
  {
    id: 'task-5',
    user_id: 'user-1',
    title: 'Learn Spanish',
    description: 'Practice Spanish conversation',
    status: 'someday' as TaskStatus,
    context: 'anywhere' as TaskContext,
    energy_level: 'medium' as TaskEnergyLevel,
    estimated_duration: '30min' as TaskDuration,
    priority: 4,
    tags: ['learning', 'personal'],
    created_at: '2024-01-05T12:00:00Z',
    updated_at: '2024-01-05T12:00:00Z',
  },
  {
    id: 'task-6',
    user_id: 'user-1',
    title: 'Complete expense report',
    description: 'Submit Q4 expense report',
    status: 'completed' as TaskStatus,
    context: 'computer' as TaskContext,
    energy_level: 'medium' as TaskEnergyLevel,
    estimated_duration: '15min' as TaskDuration,
    priority: 2,
    tags: ['admin', 'work'],
    completed_at: '2024-01-06T16:00:00Z',
    created_at: '2024-01-05T10:00:00Z',
    updated_at: '2024-01-06T16:00:00Z',
  },
]

// Mock Projects
export const mockProjects: Project[] = [
  {
    id: 'project-1',
    user_id: 'user-1',
    name: 'Website Redesign',
    description: 'Complete overhaul of company website',
    status: 'active' as ProjectStatus,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'project-2',
    user_id: 'user-1',
    name: 'Home Office Setup',
    description: 'Organize and optimize home workspace',
    status: 'active' as ProjectStatus,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
  {
    id: 'project-3',
    user_id: 'user-1',
    name: 'Q4 Planning',
    description: 'Annual planning and goal setting',
    status: 'complete' as ProjectStatus,
    created_at: '2023-12-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
]

// Mock Reviews
export const mockReviews: Review[] = [
  {
    id: 'review-1',
    user_id: 'user-1',
    type: 'daily' as ReviewType,
    completed_at: '2024-01-06T18:00:00Z',
    notes: 'Good progress on project tasks',
    duration_minutes: 15,
    tasks_reviewed: 8,
    projects_reviewed: 2,
    progress_data: {
      current_step: 5,
      total_steps: 5,
      completed_steps: ['welcome', 'calendar_check', 'task_triage', 'planning', 'completion'],
      started_at: '2024-01-06T17:45:00Z',
    },
    created_at: '2024-01-06T17:45:00Z',
    updated_at: '2024-01-06T18:00:00Z',
  },
  {
    id: 'review-2',
    user_id: 'user-1',
    type: 'weekly' as ReviewType,
    completed_at: '2024-01-07T10:00:00Z',
    notes: 'Need to focus more on someday/maybe items',
    duration_minutes: 45,
    tasks_reviewed: 25,
    projects_reviewed: 5,
    progress_data: {
      current_step: 8,
      total_steps: 8,
      completed_steps: [
        'welcome',
        'calendar_check',
        'inbox_process',
        'task_triage',
        'project_review',
        'someday_review',
        'planning',
        'completion',
      ],
      started_at: '2024-01-07T09:15:00Z',
    },
    created_at: '2024-01-07T09:15:00Z',
    updated_at: '2024-01-07T10:00:00Z',
  },
]

// Mock Supabase responses
export const mockSupabaseResponses = {
  tasks: {
    select: { data: mockTasks, error: null },
    insert: { data: mockTasks[0], error: null },
    update: { data: { ...mockTasks[0], updated_at: new Date().toISOString() }, error: null },
    delete: { data: null, error: null },
  },
  projects: {
    select: { data: mockProjects, error: null },
    insert: { data: mockProjects[0], error: null },
    update: { data: { ...mockProjects[0], updated_at: new Date().toISOString() }, error: null },
    delete: { data: null, error: null },
  },
  reviews: {
    select: { data: mockReviews, error: null },
    insert: { data: mockReviews[0], error: null },
    update: { data: { ...mockReviews[0], updated_at: new Date().toISOString() }, error: null },
    delete: { data: null, error: null },
  },
  auth: {
    getUser: { data: { user: mockUsers[0] }, error: null },
    getSession: { data: { session: { user: mockUsers[0] } }, error: null },
    signInWithOtp: { data: {}, error: null },
    signOut: { error: null },
  },
}

// Test user credentials
export const testCredentials = {
  email: 'test@example.com',
  otp: '123456',
  invalidEmail: 'invalid@example.com',
  invalidOtp: '000000',
}

// Task factory function for creating test tasks
export const createMockTask = (overrides: Partial<Task> = {}): Task => ({
  id: `task-${Date.now()}-${Math.random()}`,
  user_id: 'user-1',
  title: 'Test Task',
  description: 'Test task description',
  status: 'captured' as TaskStatus,
  context: 'computer' as TaskContext,
  energy_level: 'medium' as TaskEnergyLevel,
  estimated_duration: '15min' as TaskDuration,
  priority: 3,
  tags: ['test'],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

// Project factory function for creating test projects
export const createMockProject = (overrides: Partial<Project> = {}): Project => ({
  id: `project-${Date.now()}-${Math.random()}`,
  user_id: 'user-1',
  name: 'Test Project',
  description: 'Test project description',
  status: 'active' as ProjectStatus,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

// Review factory function for creating test reviews
export const createMockReview = (overrides: Partial<Review> = {}): Review => ({
  id: `review-${Date.now()}-${Math.random()}`,
  user_id: 'user-1',
  type: 'daily' as ReviewType,
  completed_at: new Date().toISOString(),
  duration_minutes: 15,
  tasks_reviewed: 5,
  projects_reviewed: 2,
  progress_data: {
    current_step: 1,
    total_steps: 5,
    completed_steps: ['welcome'],
    started_at: new Date().toISOString(),
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})