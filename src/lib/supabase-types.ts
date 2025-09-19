// Supabase table types for type safety
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          status:
            | "captured"
            | "next_action"
            | "project"
            | "waiting_for"
            | "someday";
          project_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          status?:
            | "captured"
            | "next_action"
            | "project"
            | "waiting_for"
            | "someday";
          project_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          status?:
            | "captured"
            | "next_action"
            | "project"
            | "waiting_for"
            | "someday";
          project_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          status: "active" | "complete";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          status?: "active" | "complete";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          status?: "active" | "complete";
          created_at?: string;
          updated_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          user_id: string;
          type: "daily" | "weekly";
          completed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: "daily" | "weekly";
          completed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: "daily" | "weekly";
          completed_at?: string;
        };
      };
    };
  };
}
