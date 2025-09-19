import {
  Task,
  Project,
  Review,
  TaskStatus,
  TaskContext,
  TaskEnergyLevel,
  TaskDuration,
  User,
} from "../../src/types/database";

// Test user fixtures
export const TEST_USERS: Record<string, Partial<User>> = {
  standard: {
    id: "test-user-1",
    email: "test@example.com",
  },
  premium: {
    id: "test-user-2",
    email: "premium@example.com",
  },
  newUser: {
    id: "test-user-3",
    email: "newuser@example.com",
  },
};

// Test task fixtures
export const TEST_TASKS: Record<string, Partial<Task>> = {
  inbox1: {
    id: "task-1",
    title: "Review quarterly reports",
    description: "Review Q3 reports and prepare summary",
    status: "captured",
    context: "office",
    energy_level: "high",
    estimated_duration: "2hour+",
    priority: 2,
    tags: ["work", "quarterly", "reports"],
  },
  inbox2: {
    id: "task-2",
    title: "Call dentist for appointment",
    description: "Schedule annual checkup",
    status: "captured",
    context: "calls",
    energy_level: "low",
    estimated_duration: "5min",
    priority: 3,
    tags: ["health", "personal"],
  },
  nextAction1: {
    id: "task-3",
    title: "Send follow-up email to client",
    description: "Follow up on proposal discussion",
    status: "next_action",
    context: "computer",
    energy_level: "medium",
    estimated_duration: "15min",
    priority: 1,
    tags: ["work", "client", "urgent"],
  },
  nextAction2: {
    id: "task-4",
    title: "Buy groceries for dinner party",
    description: "Get ingredients for Saturday dinner",
    status: "next_action",
    context: "errands",
    energy_level: "medium",
    estimated_duration: "1hour",
    priority: 2,
    tags: ["personal", "social"],
  },
  waiting1: {
    id: "task-5",
    title: "Waiting for design feedback from team",
    description: "Sent mockups on Monday, waiting for response",
    status: "waiting_for",
    context: "anywhere",
    energy_level: "low",
    estimated_duration: "5min",
    priority: 2,
    tags: ["work", "design", "team"],
  },
  someday1: {
    id: "task-6",
    title: "Learn Spanish",
    description: "Take online course when time permits",
    status: "someday",
    context: "home",
    energy_level: "medium",
    estimated_duration: "30min",
    priority: 4,
    tags: ["personal", "learning", "language"],
  },
  completed1: {
    id: "task-7",
    title: "Submit expense reports",
    description: "Monthly expense submission",
    status: "completed",
    context: "computer",
    energy_level: "medium",
    estimated_duration: "30min",
    priority: 2,
    tags: ["work", "admin"],
    completed_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
  },
  projectTask1: {
    id: "task-8",
    title: "Research venue options",
    description: "Find 3-5 potential venues for company retreat",
    status: "next_action",
    project_id: "project-1",
    context: "computer",
    energy_level: "medium",
    estimated_duration: "1hour",
    priority: 2,
    tags: ["work", "retreat", "planning"],
  },
  projectTask2: {
    id: "task-9",
    title: "Book catering for retreat",
    description: "Contact caterers and get quotes",
    status: "waiting_for",
    project_id: "project-1",
    context: "calls",
    energy_level: "low",
    estimated_duration: "30min",
    priority: 2,
    tags: ["work", "retreat", "catering"],
  },
  urgentTask: {
    id: "task-10",
    title: "Fix critical bug in production",
    description: "Payment gateway integration failing",
    status: "next_action",
    context: "computer",
    energy_level: "high",
    estimated_duration: "2hour+",
    priority: 1,
    tags: ["work", "urgent", "bug", "critical"],
    due_date: new Date().toISOString(), // Due today
  },
  overdueTask: {
    id: "task-11",
    title: "Submit insurance claim",
    description: "Car accident insurance claim",
    status: "next_action",
    context: "calls",
    energy_level: "medium",
    estimated_duration: "30min",
    priority: 1,
    tags: ["personal", "insurance"],
    due_date: new Date(Date.now() - 86400000).toISOString(), // Yesterday (overdue)
  },
};

// Test project fixtures
export const TEST_PROJECTS: Record<string, Partial<Project>> = {
  active1: {
    id: "project-1",
    name: "Company Retreat Planning",
    status: "active",
  },
  active2: {
    id: "project-2",
    name: "Website Redesign",
    status: "active",
  },
  completed1: {
    id: "project-3",
    name: "Q3 Marketing Campaign",
    status: "complete",
  },
};

// Test review fixtures
export const TEST_REVIEWS: Record<string, Partial<Review>> = {
  dailyCompleted: {
    id: "review-1",
    type: "daily",
    completed_at: new Date().toISOString(),
    duration_minutes: 8,
    tasks_reviewed: 12,
    projects_reviewed: 3,
    notes: "Good progress today, focused on high-priority items",
  },
  weeklyInProgress: {
    id: "review-2",
    type: "weekly",
    progress_data: {
      current_step: 3,
      total_steps: 8,
      completed_steps: ["welcome", "calendar_check", "inbox_process"],
      started_at: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
    },
  },
};

// Test engagement contexts
export const TEST_CONTEXTS = {
  atOffice: {
    current_location: "office" as const,
    available_time: "2hour+" as TaskDuration,
    current_energy: "high" as TaskEnergyLevel,
    available_tools: ["computer", "phone", "printer"],
  },
  atHome: {
    current_location: "home" as const,
    available_time: "30min" as TaskDuration,
    current_energy: "medium" as TaskEnergyLevel,
    available_tools: ["computer", "phone"],
  },
  mobile: {
    current_location: "mobile" as const,
    available_time: "15min" as TaskDuration,
    current_energy: "low" as TaskEnergyLevel,
    available_tools: ["phone"],
  },
  shortBreak: {
    current_location: "office" as const,
    available_time: "5min" as TaskDuration,
    current_energy: "low" as TaskEnergyLevel,
    available_tools: ["phone", "computer"],
  },
};

// Sample task filters for testing
export const TEST_FILTERS = {
  highPriority: {
    priority: [1, 2],
  },
  quickTasks: {
    estimated_duration: ["5min", "15min"],
  },
  officeTasks: {
    context: ["office", "computer"],
  },
  workTags: {
    tags: ["work"],
  },
  dueTasks: {
    due_today: true,
  },
  overdueTasks: {
    overdue: true,
  },
  projectTasks: {
    has_project: true,
  },
};

// Sample review workflows
export const REVIEW_WORKFLOWS = {
  daily: {
    steps: [
      { id: "welcome", title: "Welcome", timeEstimate: "1 min" },
      { id: "calendar_check", title: "Check Calendar", timeEstimate: "2 min" },
      {
        id: "task_triage",
        title: "Review Today's Tasks",
        timeEstimate: "3 min",
      },
      { id: "planning", title: "Plan Tomorrow", timeEstimate: "2 min" },
      { id: "reflection", title: "Quick Reflection", timeEstimate: "1 min" },
      { id: "completion", title: "Complete Review", timeEstimate: "1 min" },
    ],
    totalTime: "10 minutes",
  },
  weekly: {
    steps: [
      {
        id: "welcome",
        title: "Welcome to Weekly Review",
        timeEstimate: "2 min",
      },
      {
        id: "calendar_check",
        title: "Review Past Week Calendar",
        timeEstimate: "5 min",
      },
      { id: "inbox_process", title: "Process Inbox", timeEstimate: "15 min" },
      {
        id: "project_review",
        title: "Review All Projects",
        timeEstimate: "20 min",
      },
      {
        id: "waiting_for_review",
        title: "Review Waiting For",
        timeEstimate: "5 min",
      },
      {
        id: "someday_review",
        title: "Review Someday/Maybe",
        timeEstimate: "10 min",
      },
      { id: "planning", title: "Plan Next Week", timeEstimate: "10 min" },
      { id: "reflection", title: "Weekly Reflection", timeEstimate: "5 min" },
      { id: "completion", title: "Complete Review", timeEstimate: "3 min" },
    ],
    totalTime: "75 minutes",
  },
};

// AI coaching prompts for testing
export const AI_COACHING_PROMPTS = {
  inboxProcessing: [
    "Great job processing your inbox! You've clarified 8 items so far.",
    "Consider if this task is actually a project with multiple steps.",
    "This seems like a quick task - could you do it in under 2 minutes?",
    "Remember to assign a context to help you work more efficiently.",
  ],
  projectReview: [
    "This project has been active for 3 months. Is it still a priority?",
    "Consider breaking this large project into smaller, actionable steps.",
    "You've made good progress! 3 out of 5 tasks completed this week.",
  ],
  dailyReflection: [
    "You completed 6 tasks today - that's above your average!",
    "Notice you worked mostly on 'computer' tasks today. Good focus!",
    "Tomorrow looks busy. Consider which tasks are truly essential.",
  ],
};

// Performance test data
export const PERFORMANCE_TEST_DATA = {
  largeBatchTasks: Array.from({ length: 100 }, (_, i) => ({
    title: `Batch Task ${i + 1}`,
    status: "captured" as TaskStatus,
    context: ["office", "home", "calls", "errands"][i % 4] as TaskContext,
    energy_level: ["high", "medium", "low"][i % 3] as TaskEnergyLevel,
    estimated_duration: ["5min", "15min", "30min", "1hour"][
      i % 4
    ] as TaskDuration,
    priority: (i % 5) + 1,
    tags: [`tag${i % 10}`, "performance-test"],
  })),

  searchQueries: [
    "email",
    "call",
    "meeting",
    "report",
    "review",
    "urgent",
    "project",
    "client",
    "personal",
    "work",
  ],
};

// Accessibility test scenarios
export const ACCESSIBILITY_SCENARIOS = {
  keyboardNavigation: [
    { action: "Tab", expected: "Focus moves to next interactive element" },
    {
      action: "Shift+Tab",
      expected: "Focus moves to previous interactive element",
    },
    { action: "Enter", expected: "Activates focused button or link" },
    { action: "Space", expected: "Toggles checkbox or activates button" },
    { action: "Escape", expected: "Closes modal or cancels operation" },
  ],
  screenReaderContent: [
    {
      element: "task-item",
      expected: "Task title, status, and context announced",
    },
    {
      element: "capture-input",
      expected: "Form field purpose and requirements announced",
    },
    {
      element: "navigation",
      expected: "Current page and available options announced",
    },
  ],
};

// Mock API responses
export const MOCK_API_RESPONSES = {
  login: {
    success: {
      user: TEST_USERS.standard,
      session: { access_token: "mock-token", refresh_token: "mock-refresh" },
    },
    error: {
      error: { message: "Invalid credentials" },
    },
  },

  tasks: {
    list: Object.values(TEST_TASKS),
    create: TEST_TASKS.inbox1,
    update: { ...TEST_TASKS.inbox1, status: "next_action" },
    delete: { message: "Task deleted successfully" },
  },

  projects: {
    list: Object.values(TEST_PROJECTS),
    create: TEST_PROJECTS.active1,
  },

  reviews: {
    daily: TEST_REVIEWS.dailyCompleted,
    weekly: TEST_REVIEWS.weeklyInProgress,
  },
};

// Test environment configuration
export const TEST_CONFIG = {
  baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3000",
  supabaseURL: process.env.SUPABASE_URL || "http://localhost:54321",
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "test-anon-key",

  timeouts: {
    default: 30000,
    navigation: 60000,
    assertion: 10000,
  },

  retries: {
    ci: 2,
    local: 0,
  },

  viewport: {
    desktop: { width: 1280, height: 720 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 667 },
  },
};
