"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import type { Task, CreateTaskInput, UpdateTaskInput } from "@/types/database";

interface UseTasksOptions {
  autoRefresh?: boolean;
  realTimeSync?: boolean;
}

interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  createTask: (input: CreateTaskInput) => Promise<Task>;
  updateTask: (id: string, input: UpdateTaskInput) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
  optimisticAdd: (task: Partial<Task>) => void;
  optimisticUpdate: (id: string, updates: Partial<Task>) => void;
  optimisticRemove: (id: string) => void;
}

export function useTasks(options: UseTasksOptions = {}): UseTasksReturn {
  const { autoRefresh = true, realTimeSync = true } = options;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();
  const subscribedRef = useRef(false);

  // Fetch tasks from Supabase
  const fetchTasks = useCallback(async () => {
    try {
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setTasks(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tasks");
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Create a new task
  const createTask = useCallback(
    async (input: CreateTaskInput): Promise<Task> => {
      try {
        setError(null);

        const { data, error: createError } = await supabase
          .from("tasks")
          .insert({
            ...input,
            status: input.status || "captured",
          })
          .select()
          .single();

        if (createError) {
          throw new Error(createError.message);
        }

        if (!data) {
          throw new Error("No data returned from task creation");
        }

        // Update local state optimistically if real-time is disabled
        if (!realTimeSync) {
          setTasks((prev) => [data, ...prev]);
        }

        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create task";
        setError(errorMessage);
        throw err;
      }
    },
    [supabase, realTimeSync]
  );

  // Update an existing task
  const updateTask = useCallback(
    async (id: string, input: UpdateTaskInput): Promise<Task> => {
      try {
        setError(null);

        const { data, error: updateError } = await supabase
          .from("tasks")
          .update({
            ...input,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select()
          .single();

        if (updateError) {
          throw new Error(updateError.message);
        }

        if (!data) {
          throw new Error("No data returned from task update");
        }

        // Update local state optimistically if real-time is disabled
        if (!realTimeSync) {
          setTasks((prev) =>
            prev.map((task) => (task.id === id ? data : task))
          );
        }

        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update task";
        setError(errorMessage);
        throw err;
      }
    },
    [supabase, realTimeSync]
  );

  // Delete a task
  const deleteTask = useCallback(
    async (id: string): Promise<void> => {
      try {
        setError(null);

        const { error: deleteError } = await supabase
          .from("tasks")
          .delete()
          .eq("id", id);

        if (deleteError) {
          throw new Error(deleteError.message);
        }

        // Update local state optimistically if real-time is disabled
        if (!realTimeSync) {
          setTasks((prev) => prev.filter((task) => task.id !== id));
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete task";
        setError(errorMessage);
        throw err;
      }
    },
    [supabase, realTimeSync]
  );

  // Optimistic UI updates
  const optimisticAdd = useCallback((task: Partial<Task>) => {
    const optimisticTask: Task = {
      id: `temp-${Date.now()}`,
      user_id: "",
      title: "",
      status: "captured",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...task,
    };
    setTasks((prev) => [optimisticTask, ...prev]);
  }, []);

  const optimisticUpdate = useCallback((id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, ...updates, updated_at: new Date().toISOString() }
          : task
      )
    );
  }, []);

  const optimisticRemove = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }, []);

  // Refresh tasks
  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchTasks();
  }, [fetchTasks]);

  // Set up real-time subscription
  useEffect(() => {
    if (!realTimeSync || subscribedRef.current) return;

    const subscription = supabase
      .channel("tasks_channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
        },
        (payload) => {
          switch (payload.eventType) {
            case "INSERT":
              if (payload.new) {
                setTasks((prev) => {
                  // Avoid duplicates
                  const exists = prev.some(
                    (task) => task.id === payload.new.id
                  );
                  if (exists) return prev;
                  return [payload.new as Task, ...prev];
                });
              }
              break;

            case "UPDATE":
              if (payload.new) {
                setTasks((prev) =>
                  prev.map((task) =>
                    task.id === payload.new.id ? (payload.new as Task) : task
                  )
                );
              }
              break;

            case "DELETE":
              if (payload.old) {
                setTasks((prev) =>
                  prev.filter((task) => task.id !== payload.old.id)
                );
              }
              break;
          }
        }
      )
      .subscribe();

    subscribedRef.current = true;

    return () => {
      subscription.unsubscribe();
      subscribedRef.current = false;
    };
  }, [supabase, realTimeSync]);

  // Initial fetch
  useEffect(() => {
    if (autoRefresh) {
      fetchTasks();
    }
  }, [fetchTasks, autoRefresh]);

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    refresh,
    optimisticAdd,
    optimisticUpdate,
    optimisticRemove,
  };
}
