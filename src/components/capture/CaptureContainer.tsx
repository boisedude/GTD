"use client";

import React, { useState, useCallback, useEffect } from "react";
import { CaptureInput } from "./CaptureInput";
import { QuickCaptureModal } from "./QuickCaptureModal";
import { useTaskCapture } from "@/hooks/useTaskCapture";
import {
  useKeyboardShortcuts,
  GTD_SHORTCUTS,
} from "@/hooks/useKeyboardShortcuts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CreateTaskInput } from "@/types/database";

interface CaptureContainerProps {
  className?: string;
  alwaysVisible?: boolean;
  autoFocus?: boolean;
  showStatus?: boolean;
}

export function CaptureContainer({
  className,
  alwaysVisible = true,
  autoFocus = false,
  showStatus = true,
}: CaptureContainerProps) {
  const [isDetailedModalOpen, setIsDetailedModalOpen] = useState(false);
  const [recentCaptures, setRecentCaptures] = useState<string[]>([]);

  const {
    isOnline,
    isSaving,
    lastSaveTime,
    error,
    captureTask,
    quickCapture,
    clearError,
    offlineQueueCount,
    syncOfflineQueue,
  } = useTaskCapture();

  // Handle quick capture from input
  const handleQuickCapture = useCallback(
    async (title: string) => {
      try {
        const task = await quickCapture(title);

        // Add to recent captures for quick feedback
        setRecentCaptures((prev) => [task.title, ...prev.slice(0, 2)]);

        // Clear recent after 3 seconds
        setTimeout(() => {
          setRecentCaptures((prev) => prev.filter((t) => t !== task.title));
        }, 3000);
      } catch (err) {
        console.error("Quick capture failed:", err);
        // Error is handled by the hook
      }
    },
    [quickCapture]
  );

  // Handle detailed capture from modal
  const handleDetailedCapture = useCallback(
    async (input: CreateTaskInput) => {
      try {
        await captureTask(input);
        setIsDetailedModalOpen(false);
      } catch (err) {
        console.error("Detailed capture failed:", err);
        // Keep modal open to allow retry
      }
    },
    [captureTask]
  );

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      ...GTD_SHORTCUTS.QUICK_CAPTURE,
      action: () => {
        // Focus the quick capture input
        const input = document.querySelector(
          "[data-capture-input]"
        ) as HTMLInputElement;
        if (input) {
          input.focus();
        }
      },
    },
    {
      ...GTD_SHORTCUTS.DETAILED_CAPTURE,
      action: () => setIsDetailedModalOpen(true),
    },
    {
      ...GTD_SHORTCUTS.ESCAPE,
      action: () => {
        setIsDetailedModalOpen(false);
        clearError();
      },
    },
  ]);

  // Auto-focus behavior
  useEffect(() => {
    if (autoFocus) {
      const timer = setTimeout(() => {
        const input = document.querySelector(
          "[data-capture-input]"
        ) as HTMLInputElement;
        if (input) {
          input.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="h-4 w-4 text-red-500" />;
    if (isSaving) return <Clock className="h-4 w-4 text-blue-500" />;
    if (error) return <AlertCircle className="h-4 w-4 text-red-500" />;
    if (lastSaveTime)
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    return <Wifi className="h-4 w-4 text-gray-400" />;
  };

  const getStatusText = () => {
    if (!isOnline) {
      return offlineQueueCount > 0
        ? `Offline - ${offlineQueueCount} queued`
        : "Offline mode";
    }
    if (isSaving) return "Saving...";
    if (error) return "Error occurred";
    if (lastSaveTime) {
      const timeDiff = Date.now() - lastSaveTime.getTime();
      if (timeDiff < 60000) return "Just saved";
      if (timeDiff < 3600000)
        return `Saved ${Math.floor(timeDiff / 60000)}m ago`;
      return "Saved earlier";
    }
    return "Ready to capture";
  };

  return (
    <div className={cn("w-full space-y-3", className)}>
      {/* Main capture input */}
      <div className="relative">
        <CaptureInput
          onTaskCapture={handleQuickCapture}
          onDetailedCapture={() => setIsDetailedModalOpen(true)}
          placeholder="What's on your mind? (⌘+N)"
          autoFocus={autoFocus}
          className={cn(
            "transition-all duration-200",
            alwaysVisible && "sticky top-4 z-40 shadow-lg"
          )}
        />

        {/* Mobile-friendly quick actions bar - Enhanced for touch */}
        <div className="flex items-center justify-between mt-3 px-1 sm:hidden">
          <Button
            variant="ghost"
            onClick={() => setIsDetailedModalOpen(true)}
            className="min-h-[44px] px-4 text-sm font-medium text-brand-teal hover:bg-brand-teal/10 active:scale-95 transition-all duration-200"
          >
            Add Details
          </Button>

          {offlineQueueCount > 0 && isOnline && (
            <Button
              variant="ghost"
              onClick={syncOfflineQueue}
              className="min-h-[44px] px-4 text-sm font-medium text-blue-600 hover:bg-blue-50 active:scale-95 transition-all duration-200"
            >
              <span className="flex items-center gap-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                Sync {offlineQueueCount}
              </span>
            </Button>
          )}
        </div>
      </div>

      {/* Status bar */}
      {showStatus && (
        <Card className="p-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="text-muted-foreground">{getStatusText()}</span>
            </div>

            {/* Recent captures feedback */}
            {recentCaptures.length > 0 && (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle2 className="h-3 w-3" />
                <span>
                  {recentCaptures.length === 1
                    ? "Captured!"
                    : `${recentCaptures.length} captured`}
                </span>
              </div>
            )}

            {/* Error display */}
            {error && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="text-xs text-red-600 p-1 h-auto"
              >
                Dismiss error
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Keyboard shortcuts hint (desktop only) */}
      <div className="hidden lg:block text-xs text-muted-foreground text-center space-y-1">
        <div>
          <kbd className="px-1 py-0.5 bg-muted rounded text-xs">⌘+N</kbd> Quick
          capture •
          <kbd className="px-1 py-0.5 bg-muted rounded text-xs ml-1">
            ⌘+Shift+N
          </kbd>{" "}
          Detailed
        </div>
      </div>

      {/* Detailed capture modal */}
      <QuickCaptureModal
        isOpen={isDetailedModalOpen}
        onClose={() => setIsDetailedModalOpen(false)}
        onTaskCreate={handleDetailedCapture}
      />
    </div>
  );
}
