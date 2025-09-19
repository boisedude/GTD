"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Loader2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CaptureInputProps {
  onTaskCapture?: (title: string) => Promise<void>;
  onDetailedCapture?: () => void;
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

type CaptureState = "idle" | "typing" | "saving" | "success" | "error";

export function CaptureInput({
  onTaskCapture,
  onDetailedCapture,
  className,
  placeholder = "What's on your mind?",
  autoFocus = false,
}: CaptureInputProps) {
  const [title, setTitle] = useState("");
  const [state, setState] = useState<CaptureState>("idle");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Auto-save delay (2 seconds after user stops typing)
  const AUTO_SAVE_DELAY = 2000;
  const SUCCESS_DISPLAY_DURATION = 1500;

  // Clear any pending saves
  const clearSaveTimeout = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = undefined;
    }
  }, []);

  // Handle auto-save
  const scheduleAutoSave = useCallback(() => {
    if (!title.trim() || !onTaskCapture) return;

    clearSaveTimeout();
    setState("typing");

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        setState("saving");
        await onTaskCapture(title.trim());
        setState("success");
        setTitle("");
        setError(null);

        // Show success state briefly, then return to idle
        setTimeout(() => {
          setState("idle");
        }, SUCCESS_DISPLAY_DURATION);
      } catch (err) {
        setState("error");
        setError(err instanceof Error ? err.message : "Failed to save task");

        // Return to typing state after showing error
        setTimeout(() => {
          setState("typing");
        }, 2000);
      }
    }, AUTO_SAVE_DELAY);
  }, [title, onTaskCapture, clearSaveTimeout]);

  // Handle input changes
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setTitle(newValue);
      setError(null);

      if (newValue.trim()) {
        scheduleAutoSave();
      } else {
        clearSaveTimeout();
        setState("idle");
      }
    },
    [scheduleAutoSave, clearSaveTimeout]
  );

  // Handle immediate save (Enter key or button click)
  const handleImmediateSave = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();

      if (!title.trim() || !onTaskCapture || state === "saving") return;

      clearSaveTimeout();

      try {
        setState("saving");
        await onTaskCapture(title.trim());
        setState("success");
        setTitle("");
        setError(null);

        // Focus back to input after successful save
        setTimeout(() => {
          setState("idle");
          inputRef.current?.focus();
        }, SUCCESS_DISPLAY_DURATION);
      } catch (err) {
        setState("error");
        setError(err instanceof Error ? err.message : "Failed to save task");

        setTimeout(() => {
          setState("idle");
        }, 2000);
      }
    },
    [title, onTaskCapture, state, clearSaveTimeout]
  );

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleImmediateSave();
      } else if (e.key === "Escape") {
        setTitle("");
        clearSaveTimeout();
        setState("idle");
        setError(null);
      } else if (e.key === "Tab" && e.shiftKey && onDetailedCapture) {
        e.preventDefault();
        onDetailedCapture();
      }
    },
    [handleImmediateSave, clearSaveTimeout, onDetailedCapture]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearSaveTimeout();
    };
  }, [clearSaveTimeout]);

  // Auto-focus if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const getStatusIcon = () => {
    switch (state) {
      case "saving":
        return <Loader2 className="h-4 w-4 animate-spin text-brand-gray-500" />;
      case "success":
        return <Check className="h-4 w-4 text-success" />;
      case "error":
        return <X className="h-4 w-4 text-error" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (state) {
      case "typing":
        return "Auto-saving...";
      case "saving":
        return "Saving...";
      case "success":
        return "Saved!";
      case "error":
        return error || "Error saving";
      default:
        return null;
    }
  };

  return (
    <Card
      className={cn(
        "w-full border-2 transition-all duration-300 ease-out",
        className,
        {
          "border-brand-teal/50 shadow-lg ring-2 ring-brand-teal/20 scale-[1.02]":
            state === "typing" || title.trim(),
          "border-success/50 bg-success/5 shadow-md": state === "success",
          "border-error/50 bg-error/5 shadow-md": state === "error",
        }
      )}
    >
      <form onSubmit={handleImmediateSave} className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              type="text"
              value={title}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={state === "saving"}
              className={cn(
                "border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0",
                "text-base sm:text-brand-sm md:text-brand-base transition-all duration-200",
                "placeholder:text-brand-gray-500/60",
                "min-h-[44px] py-3 px-4", // Mobile-first touch target
                "text-[16px] sm:text-[14px] md:text-[16px]", // Prevent iOS zoom
                state === "saving" && "cursor-not-allowed opacity-60"
              )}
              autoComplete="off"
              maxLength={500}
              data-capture-input
            />

            {/* Status indicator inside input */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <div
                className={cn("transition-all duration-200", {
                  "scale-110": state === "success",
                  "animate-pulse": state === "saving",
                })}
              >
                {getStatusIcon()}
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-1">
            {/* Immediate save button - mobile optimized */}
            <Button
              type="submit"
              size="touch" // Use mobile-optimized touch size
              disabled={!title.trim() || state === "saving"}
              className={cn(
                "min-h-[44px] min-w-[44px] px-3 transition-all duration-200 sm:h-8 sm:px-2 sm:min-w-0",
                state === "saving" && "cursor-not-allowed opacity-60",
                title.trim() &&
                  "bg-brand-teal hover:bg-brand-teal/90 border-brand-teal"
              )}
            >
              {state === "saving" ? (
                <Loader2 className="h-5 w-5 sm:h-4 sm:w-4 animate-spin" />
              ) : (
                <Plus className="h-5 w-5 sm:h-4 sm:w-4" />
              )}
              <span className="sr-only">Add task</span>
            </Button>

            {/* Detailed capture button */}
            {onDetailedCapture && (
              <Button
                type="button"
                variant="outline"
                size="touch"
                onClick={onDetailedCapture}
                className="min-h-[44px] px-3 sm:h-8 sm:px-2 hidden xs:flex transition-all duration-200 hover:bg-brand-gray-100"
              >
                <span className="text-sm">Details</span>
              </Button>
            )}
          </div>
        </div>

        {/* Status text with animation */}
        {getStatusText() && (
          <div
            className={cn(
              "mt-2 text-brand-xs transition-all duration-300 animate-in slide-in-from-top-1 fade-in",
              {
                "text-brand-gray-600": state === "typing" || state === "saving",
                "text-success font-medium": state === "success",
                "text-error font-medium": state === "error",
              }
            )}
          >
            {getStatusText()}
          </div>
        )}

        {/* Enhanced keyboard shortcuts hint */}
        <div className="mt-2 text-brand-xs text-brand-gray-500/60 hidden sm:flex items-center gap-4">
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-brand-gray-100 rounded text-xs border">
              Enter
            </kbd>
            <span>to save</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-brand-gray-100 rounded text-xs border">
              Esc
            </kbd>
            <span>to clear</span>
          </div>
          {onDetailedCapture && (
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-brand-gray-100 rounded text-xs border">
                Shift+Tab
              </kbd>
              <span>for details</span>
            </div>
          )}
        </div>
      </form>
    </Card>
  );
}
