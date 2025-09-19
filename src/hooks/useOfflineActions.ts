"use client";

import { useState, useEffect, useCallback } from "react";
import type { TaskAction } from "@/types/database";

interface OfflineAction {
  id: string;
  taskId: string;
  action: TaskAction;
  timestamp: number;
  retries: number;
}

interface UseOfflineActionsOptions {
  maxRetries?: number;
  retryDelay?: number;
  onSync?: (action: OfflineAction) => void;
  onError?: (action: OfflineAction, error: Error) => void;
}

interface UseOfflineActionsReturn {
  isOnline: boolean;
  pendingActions: OfflineAction[];
  queueAction: (taskId: string, action: TaskAction) => string;
  syncPendingActions: () => Promise<void>;
  clearPendingActions: () => void;
  removePendingAction: (actionId: string) => void;
}

const STORAGE_KEY = "gtd_offline_actions";

export function useOfflineActions(
  options: UseOfflineActionsOptions = {}
): UseOfflineActionsReturn {
  const { maxRetries = 3, retryDelay = 1000, onSync, onError } = options;

  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [pendingActions, setPendingActions] = useState<OfflineAction[]>([]);

  // Load pending actions from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const actions = JSON.parse(stored) as OfflineAction[];
        setPendingActions(actions);
      }
    } catch (error) {
      console.error("Failed to load offline actions:", error);
    }
  }, []);

  // Save pending actions to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pendingActions));
    } catch (error) {
      console.error("Failed to save offline actions:", error);
    }
  }, [pendingActions]);

  // Execute a single offline action
  const executeAction = useCallback(
    async (offlineAction: OfflineAction): Promise<void> => {
      try {
        // This would normally call your task update API
        // For now, we'll simulate the API call
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Remove from pending actions after successful execution
        setPendingActions((prev) =>
          prev.filter((a) => a.id !== offlineAction.id)
        );

        console.log("Successfully executed offline action:", offlineAction);
      } catch (error) {
        // Update retry count and timestamp
        setPendingActions((prev) =>
          prev.map((action) =>
            action.id === offlineAction.id
              ? {
                  ...action,
                  retries: action.retries + 1,
                  lastRetry: new Date().toISOString(),
                }
              : action
          )
        );

        throw error;
      }
    },
    []
  );

  // Sync all pending actions - define before useEffect that uses it
  const syncPendingActions = useCallback(async (): Promise<void> => {
    if (!isOnline || pendingActions.length === 0) {
      return;
    }

    const actionsToSync = pendingActions.filter((a) => a.retries < maxRetries);

    for (const action of actionsToSync) {
      try {
        await executeAction(action);
        onSync?.(action);
      } catch (error) {
        const updatedAction = {
          ...action,
          retries: action.retries + 1,
          lastRetry: new Date().toISOString(),
        };

        setPendingActions((prev) =>
          prev.map((a) => (a.id === action.id ? updatedAction : a))
        );

        onError?.(action, error as Error);
      }
    }
  }, [isOnline, pendingActions, maxRetries, executeAction, onSync, onError]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync when coming back online
      syncPendingActions();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Queue an action for offline execution
  const queueAction = useCallback(
    (taskId: string, action: TaskAction): string => {
      const offlineAction: OfflineAction = {
        id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        taskId,
        action,
        timestamp: Date.now(),
        retries: 0,
      };

      setPendingActions((prev) => [...prev, offlineAction]);
      return offlineAction.id;
    },
    []
  );

  // Clear all pending actions
  const clearPendingActions = useCallback(() => {
    setPendingActions([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear offline actions storage:", error);
    }
  }, []);

  // Remove a specific pending action
  const removePendingAction = useCallback((actionId: string) => {
    setPendingActions((prev) => prev.filter((a) => a.id !== actionId));
  }, []);

  // Auto-sync periodically when online
  useEffect(() => {
    if (!isOnline) return;

    const interval = setInterval(() => {
      if (pendingActions.length > 0) {
        syncPendingActions();
      }
    }, 30000); // Sync every 30 seconds

    return () => clearInterval(interval);
  }, [isOnline, pendingActions.length, syncPendingActions]);

  return {
    isOnline,
    pendingActions,
    queueAction,
    syncPendingActions,
    clearPendingActions,
    removePendingAction,
  };
}

// Utility function to check if a task action can be performed offline
export function canPerformOffline(action: TaskAction): boolean {
  // Most task actions can be performed offline except those requiring server-side processing
  const offlineActions = ["complete", "defer", "delegate", "update"];
  return offlineActions.includes(action.type);
}

// Utility function to get user-friendly action description
export function getActionDescription(action: TaskAction): string {
  switch (action.type) {
    case "complete":
      return "Mark as complete";
    case "defer":
      return "Defer task";
    case "delegate":
      return "Delegate task";
    case "update":
      return "Update task";
    case "delete":
      return "Delete task";
    default:
      return "Unknown action";
  }
}
