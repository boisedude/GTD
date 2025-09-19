// TypeScript types for the GTD application database schema
// These types match the Postgres enums and table structures

export type TaskStatus =
  | 'captured'
  | 'next_action'
  | 'project'
  | 'waiting_for'
  | 'someday'
  | 'completed'
  | 'cancelled';

export type ProjectStatus =
  | 'active'
  | 'complete'
  | 'cancelled'
  | 'on_hold';

export type ReviewType =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly';

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  project_id?: string;
  context?: string;
  due_date?: string;
  waiting_for?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  // Relations
  project?: Project;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
  // Relations
  tasks?: Task[];
}

export interface Review {
  id: string;
  user_id: string;
  type: ReviewType;
  completed_at: string;
  notes?: string;
  created_at: string;
}

// Database table types for Supabase
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>;
      };
      tasks: {
        Row: Task;
        Insert: Omit<Task, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
      };
      projects: {
        Row: Project;
        Insert: Omit<Project, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
      };
      reviews: {
        Row: Review;
        Insert: Omit<Review, 'id' | 'created_at'>;
        Update: Partial<Omit<Review, 'id' | 'user_id' | 'created_at'>>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      task_status: TaskStatus;
      project_status: ProjectStatus;
      review_type: ReviewType;
    };
  };
}