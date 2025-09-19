"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import type {
  Review,
  ReviewSession,
  ReviewType,
  ReviewMetrics,
  DailyReviewData,
  WeeklyReviewData,
  WeeklyInsights,
} from "@/types/database";

interface UseReviewsOptions {
  autoLoad?: boolean;
  realTimeSync?: boolean;
}

interface UseReviewsReturn {
  // Current review session
  currentSession: ReviewSession | null;
  isReviewing: boolean;

  // Review data
  dailyReviewData: DailyReviewData | null;
  weeklyReviewData: WeeklyReviewData | null;

  // Review history
  recentReviews: Review[];
  metrics: ReviewMetrics[];

  // Loading states
  loading: boolean;
  error: string | null;

  // Actions
  startReview: (type: ReviewType) => Promise<ReviewSession>;
  pauseReview: () => Promise<void>;
  resumeReview: () => Promise<void>;
  completeReviewStep: (
    stepId: string,
    data?: Record<string, unknown>
  ) => Promise<void>;
  completeReview: (notes?: string) => Promise<Review>;
  abandonReview: () => Promise<void>;

  // Data loading
  loadDailyReviewData: () => Promise<DailyReviewData>;
  loadWeeklyReviewData: () => Promise<WeeklyReviewData>;
  loadReviewHistory: () => Promise<void>;
  loadMetrics: (days?: number) => Promise<void>;

  // Analytics
  getReviewStreak: () => number;
  getCompletionRate: (days?: number) => number;
  getWeeklyInsights: () => WeeklyInsights | null;
}

export function useReviews(options: UseReviewsOptions = {}): UseReviewsReturn {
  const { autoLoad = true, realTimeSync = true } = options;

  // State
  const [currentSession, setCurrentSession] = useState<ReviewSession | null>(
    null
  );
  const [dailyReviewData, setDailyReviewData] =
    useState<DailyReviewData | null>(null);
  const [weeklyReviewData, setWeeklyReviewData] =
    useState<WeeklyReviewData | null>(null);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [metrics, setMetrics] = useState<ReviewMetrics[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();
  const subscribedRef = useRef(false);

  // Computed properties
  const isReviewing =
    currentSession?.status === "active" || currentSession?.status === "paused";

  // Start a new review session
  const startReview = useCallback(
    async (type: ReviewType): Promise<ReviewSession> => {
      try {
        setError(null);
        setLoading(true);

        // Check for existing active session
        const { data: existingSession } = await supabase
          .from("review_sessions")
          .select("*")
          .eq("status", "active")
          .maybeSingle();

        if (existingSession) {
          setCurrentSession(existingSession);
          return existingSession;
        }

        // Create new session
        const totalSteps = type === "daily" ? 6 : 10;
        const sessionData = {
          type,
          status: "active" as const,
          current_step: 0,
          total_steps: totalSteps,
          completed_steps: [],
          session_data: {},
          started_at: new Date().toISOString(),
        };

        const { data, error: createError } = await supabase
          .from("review_sessions")
          .insert(sessionData)
          .select()
          .single();

        if (createError) throw createError;

        setCurrentSession(data);

        // Load review data based on type
        if (type === "daily") {
          await loadDailyReviewData();
        } else if (type === "weekly") {
          await loadWeeklyReviewData();
        }

        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to start review";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  // Pause current review
  const pauseReview = useCallback(async (): Promise<void> => {
    if (!currentSession) return;

    try {
      const { error: updateError } = await supabase
        .from("review_sessions")
        .update({
          status: "paused",
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentSession.id);

      if (updateError) throw updateError;

      setCurrentSession((prev) =>
        prev ? { ...prev, status: "paused" } : null
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to pause review");
    }
  }, [currentSession, supabase]);

  // Resume paused review
  const resumeReview = useCallback(async (): Promise<void> => {
    if (!currentSession) return;

    try {
      const { error: updateError } = await supabase
        .from("review_sessions")
        .update({
          status: "active",
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentSession.id);

      if (updateError) throw updateError;

      setCurrentSession((prev) =>
        prev ? { ...prev, status: "active" } : null
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resume review");
    }
  }, [currentSession, supabase]);

  // Complete a review step
  const completeReviewStep = useCallback(
    async (stepId: string, data?: Record<string, unknown>): Promise<void> => {
      if (!currentSession) return;

      try {
        const completedSteps = [...currentSession.completed_steps, stepId];
        const currentStep = currentSession.current_step + 1;

        const { error: updateError } = await supabase
          .from("review_sessions")
          .update({
            current_step: currentStep,
            completed_steps: completedSteps,
            session_data: { ...currentSession.session_data, [stepId]: data },
            updated_at: new Date().toISOString(),
          })
          .eq("id", currentSession.id);

        if (updateError) throw updateError;

        setCurrentSession((prev) =>
          prev
            ? {
                ...prev,
                current_step: currentStep,
                completed_steps: completedSteps,
                session_data: { ...prev.session_data, [stepId]: data },
              }
            : null
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to complete step"
        );
      }
    },
    [currentSession, supabase]
  );

  // Complete entire review
  const completeReview = useCallback(
    async (notes?: string): Promise<Review> => {
      if (!currentSession) throw new Error("No active review session");

      try {
        setLoading(true);

        // Mark session as completed
        const { error: sessionError } = await supabase
          .from("review_sessions")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", currentSession.id);

        if (sessionError) throw sessionError;

        // Create review record
        const reviewData = {
          type: currentSession.type,
          completed_at: new Date().toISOString(),
          notes,
          duration_minutes: Math.round(
            (new Date().getTime() -
              new Date(currentSession.started_at).getTime()) /
              60000
          ),
          tasks_reviewed: Object.keys(currentSession.session_data).length,
          projects_reviewed: 0, // Calculate based on session data
          progress_data: {
            current_step: currentSession.total_steps,
            total_steps: currentSession.total_steps,
            completed_steps: currentSession.completed_steps,
            started_at: currentSession.started_at,
          },
        };

        const { data: review, error: reviewError } = await supabase
          .from("reviews")
          .insert(reviewData)
          .select()
          .single();

        if (reviewError) throw reviewError;

        // Update metrics
        await updateMetrics(currentSession.type);

        setCurrentSession(null);
        await loadReviewHistory();

        return review;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to complete review";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentSession, supabase]
  );

  // Abandon current review
  const abandonReview = useCallback(async (): Promise<void> => {
    if (!currentSession) return;

    try {
      const { error: updateError } = await supabase
        .from("review_sessions")
        .update({
          status: "abandoned",
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentSession.id);

      if (updateError) throw updateError;

      setCurrentSession(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to abandon review");
    }
  }, [currentSession, supabase]);

  // Load daily review data
  const loadDailyReviewData =
    useCallback(async (): Promise<DailyReviewData> => {
      try {
        setLoading(true);

        const today = new Date().toISOString().split("T")[0];
        const yesterday = new Date(Date.now() - 86400000)
          .toISOString()
          .split("T")[0];

        // Get tasks for today and overdue
        const { data: tasks, error: tasksError } = await supabase
          .from("tasks")
          .select("*")
          .in("status", ["next_action", "waiting_for"])
          .or(`due_date.eq.${today},due_date.lt.${today}`);

        if (tasksError) throw tasksError;

        // Get completed tasks from yesterday
        const { data: completedTasks, error: completedError } = await supabase
          .from("tasks")
          .select("*")
          .eq("status", "completed")
          .gte("completed_at", yesterday);

        if (completedError) throw completedError;

        // Get waiting for items
        const { data: waitingFor, error: waitingError } = await supabase
          .from("tasks")
          .select("*")
          .eq("status", "waiting_for");

        if (waitingError) throw waitingError;

        const data: DailyReviewData = {
          todaysTasks: tasks?.filter((t) => t.due_date === today) || [],
          overdueTasks:
            tasks?.filter((t) => t.due_date && t.due_date < today) || [],
          waitingForItems: waitingFor || [],
          completedTasks: completedTasks || [],
          tomorrowsPlan: [],
        };

        setDailyReviewData(data);
        return data;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load daily review data"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    }, [supabase]);

  // Load weekly review data
  const loadWeeklyReviewData =
    useCallback(async (): Promise<WeeklyReviewData> => {
      try {
        setLoading(true);

        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);

        // Get inbox items (captured status)
        const { data: inboxItems, error: inboxError } = await supabase
          .from("tasks")
          .select("*")
          .eq("status", "captured");

        if (inboxError) throw inboxError;

        // Get all active projects
        const { data: projects, error: projectsError } = await supabase
          .from("projects")
          .select("*")
          .eq("status", "active");

        if (projectsError) throw projectsError;

        // Get someday/maybe items
        const { data: somedayItems, error: somedayError } = await supabase
          .from("tasks")
          .select("*")
          .eq("status", "someday");

        if (somedayError) throw somedayError;

        // Get completed tasks this week
        const { data: completedTasks, error: completedError } = await supabase
          .from("tasks")
          .select("*")
          .eq("status", "completed")
          .gte("completed_at", weekStart.toISOString());

        if (completedError) throw completedError;

        // Calculate insights
        const insights: WeeklyInsights = {
          tasksCompleted: completedTasks?.length || 0,
          projectsProgressed: projects?.length || 0,
          avgTasksPerDay: (completedTasks?.length || 0) / 7,
          topContexts: [], // Calculate from task contexts
          streakDays: getReviewStreak(),
        };

        const data: WeeklyReviewData = {
          inboxItems: inboxItems || [],
          allProjects: projects || [],
          somedayItems: somedayItems || [],
          completedThisWeek: completedTasks || [],
          insights,
        };

        setWeeklyReviewData(data);
        return data;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load weekly review data"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    }, [supabase]);

  // Load review history
  const loadReviewHistory = useCallback(async (): Promise<void> => {
    try {
      const { data, error: historyError } = await supabase
        .from("reviews")
        .select("*")
        .order("completed_at", { ascending: false })
        .limit(10);

      if (historyError) throw historyError;

      setRecentReviews(data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load review history"
      );
    }
  }, [supabase]);

  // Load metrics
  const loadMetrics = useCallback(
    async (days: number = 30): Promise<void> => {
      try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data, error: metricsError } = await supabase
          .from("review_metrics")
          .select("*")
          .gte("date", startDate.toISOString().split("T")[0])
          .order("date", { ascending: false });

        if (metricsError) throw metricsError;

        setMetrics(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load metrics");
      }
    },
    [supabase]
  );

  // Update metrics after review completion
  const updateMetrics = useCallback(
    async (reviewType: ReviewType): Promise<void> => {
      try {
        const today = new Date().toISOString().split("T")[0];

        // Get or create today's metrics
        const { data: existingMetrics } = await supabase
          .from("review_metrics")
          .select("*")
          .eq("date", today)
          .maybeSingle();

        const updateData = existingMetrics
          ? {
              ...existingMetrics,
              [`${reviewType}_reviews_completed`]:
                (existingMetrics[`${reviewType}_reviews_completed`] || 0) + 1,
              updated_at: new Date().toISOString(),
            }
          : {
              date: today,
              tasks_completed: 0,
              tasks_created: 0,
              projects_updated: 0,
              inbox_items_processed: 0,
              daily_reviews_completed: reviewType === "daily" ? 1 : 0,
              weekly_reviews_completed: reviewType === "weekly" ? 1 : 0,
            };

        if (existingMetrics) {
          await supabase
            .from("review_metrics")
            .update(updateData)
            .eq("id", existingMetrics.id);
        } else {
          await supabase.from("review_metrics").insert(updateData);
        }
      } catch (err) {
        console.error("Failed to update metrics:", err);
      }
    },
    [supabase]
  );

  // Get review streak
  const getReviewStreak = useCallback((): number => {
    if (recentReviews.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check daily reviews for streak
    const dailyReviews = recentReviews
      .filter((r) => r.type === "daily")
      .sort(
        (a, b) =>
          new Date(b.completed_at).getTime() -
          new Date(a.completed_at).getTime()
      );

    for (let i = 0; i < dailyReviews.length; i++) {
      const reviewDate = new Date(dailyReviews[i].completed_at);
      reviewDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);

      if (reviewDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }, [recentReviews]);

  // Get completion rate
  const getCompletionRate = useCallback(
    (days: number = 7): number => {
      const relevantMetrics = metrics.slice(0, days);
      if (relevantMetrics.length === 0) return 0;

      const totalExpected = days;
      const totalCompleted = relevantMetrics.reduce(
        (sum, m) => sum + (m.daily_reviews_completed || 0),
        0
      );

      return Math.round((totalCompleted / totalExpected) * 100);
    },
    [metrics]
  );

  // Get weekly insights
  const getWeeklyInsights = useCallback((): WeeklyInsights | null => {
    return weeklyReviewData?.insights || null;
  }, [weeklyReviewData]);

  // Load existing active session on mount
  useEffect(() => {
    if (!autoLoad) return;

    const loadActiveSession = async () => {
      try {
        const { data: session } = await supabase
          .from("review_sessions")
          .select("*")
          .in("status", ["active", "paused"])
          .maybeSingle();

        if (session) {
          setCurrentSession(session);

          // Load appropriate review data
          if (session.type === "daily") {
            await loadDailyReviewData();
          } else if (session.type === "weekly") {
            await loadWeeklyReviewData();
          }
        }

        await loadReviewHistory();
        await loadMetrics();
      } catch (err) {
        console.error("Failed to load active session:", err);
      }
    };

    loadActiveSession();
  }, [autoLoad, supabase]);

  // Set up real-time subscription
  useEffect(() => {
    if (!realTimeSync || subscribedRef.current) return;

    const subscription = supabase
      .channel("reviews_channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "review_sessions",
        },
        (payload) => {
          if (payload.eventType === "UPDATE" && payload.new) {
            setCurrentSession((prev) =>
              prev?.id === payload.new.id
                ? (payload.new as ReviewSession)
                : prev
            );
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

  return {
    // Current session
    currentSession,
    isReviewing,

    // Review data
    dailyReviewData,
    weeklyReviewData,

    // History and metrics
    recentReviews,
    metrics,

    // Loading states
    loading,
    error,

    // Actions
    startReview,
    pauseReview,
    resumeReview,
    completeReviewStep,
    completeReview,
    abandonReview,

    // Data loading
    loadDailyReviewData,
    loadWeeklyReviewData,
    loadReviewHistory,
    loadMetrics,

    // Analytics
    getReviewStreak,
    getCompletionRate,
    getWeeklyInsights,
  };
}
