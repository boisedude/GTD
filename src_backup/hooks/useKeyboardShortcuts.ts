"use client";

import { useEffect, useCallback, useRef } from "react";

export interface KeyboardShortcut {
  key: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description?: string;
  preventDefault?: boolean;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  enableGlobal?: boolean;
  targetElement?: HTMLElement | null;
}

export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  options: UseKeyboardShortcutsOptions = {}
) {
  const { enabled = true, enableGlobal = true, targetElement = null } = options;

  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Skip if user is typing in an input
      const target = event.target as HTMLElement;
      const isInputElement =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.contentEditable === "true";

      for (const shortcut of shortcutsRef.current) {
        const {
          key,
          metaKey = false,
          ctrlKey = false,
          shiftKey = false,
          altKey = false,
          action,
          preventDefault = true,
        } = shortcut;

        // Check if the key combination matches
        const keyMatches = event.key.toLowerCase() === key.toLowerCase();
        const metaMatches = metaKey === event.metaKey;
        const ctrlMatches = ctrlKey === event.ctrlKey;
        const shiftMatches = shiftKey === event.shiftKey;
        const altMatches = altKey === event.altKey;

        if (
          keyMatches &&
          metaMatches &&
          ctrlMatches &&
          shiftMatches &&
          altMatches
        ) {
          // For certain shortcuts, allow them even in input elements
          const isAllowedInInput = ["escape", "enter"].includes(
            key.toLowerCase()
          );

          if (isInputElement && !isAllowedInInput) {
            continue;
          }

          if (preventDefault) {
            event.preventDefault();
          }

          action();
          break;
        }
      }
    },
    [enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    const element = targetElement || (enableGlobal ? document : null);
    if (!element) return;

    element.addEventListener("keydown", handleKeyDown as EventListener);

    return () => {
      element.removeEventListener("keydown", handleKeyDown as EventListener);
    };
  }, [handleKeyDown, enabled, targetElement, enableGlobal]);

  return null;
}

// Predefined common shortcuts for the GTD app
export const GTD_SHORTCUTS = {
  QUICK_CAPTURE: {
    key: "n",
    metaKey: true,
    description: "Quick capture (⌘+N)",
  },
  DETAILED_CAPTURE: {
    key: "n",
    metaKey: true,
    shiftKey: true,
    description: "Detailed capture (⌘+Shift+N)",
  },
  SEARCH: {
    key: "k",
    metaKey: true,
    description: "Search (⌘+K)",
  },
  ESCAPE: {
    key: "escape",
    description: "Close/Cancel (Esc)",
  },
  SAVE: {
    key: "enter",
    metaKey: true,
    description: "Save (⌘+Enter)",
  },
  NEXT_ACTION: {
    key: "1",
    metaKey: true,
    description: "Next Actions (⌘+1)",
  },
  PROJECTS: {
    key: "2",
    metaKey: true,
    description: "Projects (⌘+2)",
  },
  WAITING_FOR: {
    key: "3",
    metaKey: true,
    description: "Waiting For (⌘+3)",
  },
  SOMEDAY: {
    key: "4",
    metaKey: true,
    description: "Someday/Maybe (⌘+4)",
  },
  REVIEW: {
    key: "r",
    metaKey: true,
    description: "Review (⌘+R)",
  },
} as const;
