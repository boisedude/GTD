"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { TimerSession } from "@/types/database";

interface UseTimerOptions {
  onTick?: (secondsElapsed: number) => void;
  onComplete?: (session: TimerSession) => void;
  autoSave?: boolean;
}

interface UseTimerReturn {
  isRunning: boolean;
  isPaused: boolean;
  secondsElapsed: number;
  currentSession: TimerSession | null;
  formattedTime: string;
  start: (taskId: string, targetMinutes?: number) => void;
  pause: () => void;
  resume: () => void;
  stop: (notes?: string) => void;
  reset: () => void;
}

export function useTimer(options: UseTimerOptions = {}): UseTimerReturn {
  const { onTick, onComplete, autoSave = true } = options;

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [currentSession, setCurrentSession] = useState<TimerSession | null>(
    null
  );
  const [targetSeconds, setTargetSeconds] = useState<number | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);

  // Format time as MM:SS or HH:MM:SS
  const formattedTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  // Start timer
  const start = useCallback(
    (taskId: string, targetMinutes?: number) => {
      if (isRunning) return;

      const session: TimerSession = {
        id: `timer-${Date.now()}`,
        task_id: taskId,
        user_id: "", // Will be set by the backend
        started_at: new Date().toISOString(),
      };

      setCurrentSession(session);
      setIsRunning(true);
      setIsPaused(false);
      setSecondsElapsed(0);
      setTargetSeconds(targetMinutes ? targetMinutes * 60 : null);

      startTimeRef.current = Date.now();
      pausedTimeRef.current = 0;

      // Save session if autoSave is enabled
      if (autoSave) {
        try {
          localStorage.setItem("currentTimerSession", JSON.stringify(session));
        } catch (error) {
          console.warn("Failed to save timer session to localStorage:", error);
        }
      }
    },
    [isRunning, autoSave]
  );

  // Pause timer
  const pause = useCallback(() => {
    if (!isRunning || isPaused) return;

    setIsPaused(true);
    pausedTimeRef.current += Date.now() - (startTimeRef.current || 0);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [isRunning, isPaused]);

  // Resume timer
  const resume = useCallback(() => {
    if (!isRunning || !isPaused) return;

    setIsPaused(false);
    startTimeRef.current = Date.now();
  }, [isRunning, isPaused]);

  // Stop timer
  const stop = useCallback(
    (notes?: string) => {
      if (!isRunning || !currentSession) return;

      const finalSession: TimerSession = {
        ...currentSession,
        ended_at: new Date().toISOString(),
        duration_minutes: Math.round(secondsElapsed / 60),
        notes,
      };

      setCurrentSession(null);
      setIsRunning(false);
      setIsPaused(false);
      setSecondsElapsed(0);
      setTargetSeconds(null);

      startTimeRef.current = null;
      pausedTimeRef.current = 0;

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Clear saved session
      if (autoSave) {
        try {
          localStorage.removeItem("currentTimerSession");
        } catch (error) {
          console.warn(
            "Failed to clear timer session from localStorage:",
            error
          );
        }
      }

      // Call completion callback
      if (onComplete) {
        onComplete(finalSession);
      }
    },
    [isRunning, currentSession, secondsElapsed, autoSave, onComplete]
  );

  // Reset timer
  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsRunning(false);
    setIsPaused(false);
    setSecondsElapsed(0);
    setCurrentSession(null);
    setTargetSeconds(null);

    startTimeRef.current = null;
    pausedTimeRef.current = 0;

    // Clear saved session
    if (autoSave) {
      try {
        localStorage.removeItem("currentTimerSession");
      } catch (error) {
        console.warn("Failed to clear timer session from localStorage:", error);
      }
    }
  }, [autoSave]);

  // Timer tick effect
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = Math.floor(
            (Date.now() - startTimeRef.current + pausedTimeRef.current) / 1000
          );
          setSecondsElapsed(elapsed);

          if (onTick) {
            onTick(elapsed);
          }

          // Auto-stop when target is reached
          if (targetSeconds && elapsed >= targetSeconds) {
            stop("Timer completed");
          }
        }
      }, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [isRunning, isPaused, onTick, targetSeconds, stop]);

  // Restore session on mount if autoSave is enabled
  useEffect(() => {
    if (autoSave) {
      try {
        const saved = localStorage.getItem("currentTimerSession");
        if (saved) {
          const session = JSON.parse(saved) as TimerSession;
          const startTime = new Date(session.started_at).getTime();
          const elapsed = Math.floor((Date.now() - startTime) / 1000);

          // Only restore if the session is recent (less than 24 hours)
          if (elapsed < 24 * 60 * 60) {
            setCurrentSession(session);
            setSecondsElapsed(elapsed);
            // Don't auto-resume, let user decide
          } else {
            localStorage.removeItem("currentTimerSession");
          }
        }
      } catch (error) {
        console.warn(
          "Failed to restore timer session from localStorage:",
          error
        );
        localStorage.removeItem("currentTimerSession");
      }
    }
  }, [autoSave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isRunning,
    isPaused,
    secondsElapsed,
    currentSession,
    formattedTime: formattedTime(secondsElapsed),
    start,
    pause,
    resume,
    stop,
    reset,
  };
}
