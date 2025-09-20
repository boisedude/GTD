import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useKeyboardShortcuts,
  GTD_SHORTCUTS,
} from "@/hooks/useKeyboardShortcuts";
import type { KeyboardShortcut } from "@/hooks/useKeyboardShortcuts";

describe("useKeyboardShortcuts", () => {
  let mockAction: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockAction = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("basic functionality", () => {
    it("should call action when matching shortcut is pressed", () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: "n",
          metaKey: true,
          action: mockAction,
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      // Simulate cmd+n
      act(() => {
        const event = new KeyboardEvent("keydown", {
          key: "n",
          metaKey: true,
          bubbles: true,
        });
        document.dispatchEvent(event);
      });

      expect(mockAction).toHaveBeenCalledTimes(1);
    });

    it("should not call action when shortcut does not match", () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: "n",
          metaKey: true,
          action: mockAction,
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      // Simulate just 'n' without meta key
      act(() => {
        const event = new KeyboardEvent("keydown", {
          key: "n",
          bubbles: true,
        });
        document.dispatchEvent(event);
      });

      expect(mockAction).not.toHaveBeenCalled();
    });

    it("should handle multiple modifier keys", () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: "n",
          metaKey: true,
          shiftKey: true,
          action: mockAction,
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      // Simulate cmd+shift+n
      act(() => {
        const event = new KeyboardEvent("keydown", {
          key: "n",
          metaKey: true,
          shiftKey: true,
          bubbles: true,
        });
        document.dispatchEvent(event);
      });

      expect(mockAction).toHaveBeenCalledTimes(1);
    });

    it("should not call action when disabled", () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: "n",
          metaKey: true,
          action: mockAction,
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts, { enabled: false }));

      act(() => {
        const event = new KeyboardEvent("keydown", {
          key: "n",
          metaKey: true,
          bubbles: true,
        });
        document.dispatchEvent(event);
      });

      expect(mockAction).not.toHaveBeenCalled();
    });
  });

  describe("input element handling", () => {
    it("should not trigger shortcuts when typing in input elements", () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: "n",
          metaKey: true,
          action: mockAction,
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      // Create an input element
      const input = document.createElement("input");
      document.body.appendChild(input);
      input.focus();

      act(() => {
        const event = new KeyboardEvent("keydown", {
          key: "n",
          metaKey: true,
          bubbles: true,
        });
        Object.defineProperty(event, "target", {
          value: input,
          enumerable: true,
        });
        document.dispatchEvent(event);
      });

      expect(mockAction).not.toHaveBeenCalled();

      // Cleanup
      document.body.removeChild(input);
    });

    it("should not trigger shortcuts when typing in textarea elements", () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: "n",
          metaKey: true,
          action: mockAction,
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      // Create a textarea element
      const textarea = document.createElement("textarea");
      document.body.appendChild(textarea);
      textarea.focus();

      act(() => {
        const event = new KeyboardEvent("keydown", {
          key: "n",
          metaKey: true,
          bubbles: true,
        });
        Object.defineProperty(event, "target", {
          value: textarea,
          enumerable: true,
        });
        document.dispatchEvent(event);
      });

      expect(mockAction).not.toHaveBeenCalled();

      // Cleanup
      document.body.removeChild(textarea);
    });

    it("should not trigger shortcuts when typing in contentEditable elements", () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: "n",
          metaKey: true,
          action: mockAction,
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      // Create a contentEditable element
      const div = document.createElement("div");
      div.contentEditable = "true";
      document.body.appendChild(div);
      div.focus();

      act(() => {
        const event = new KeyboardEvent("keydown", {
          key: "n",
          metaKey: true,
          bubbles: true,
        });
        Object.defineProperty(event, "target", {
          value: div,
          enumerable: true,
        });
        document.dispatchEvent(event);
      });

      expect(mockAction).not.toHaveBeenCalled();

      // Cleanup
      document.body.removeChild(div);
    });

    it("should allow escape and enter shortcuts in input elements", () => {
      const escapeAction = vi.fn();
      const enterAction = vi.fn();

      const shortcuts: KeyboardShortcut[] = [
        {
          key: "escape",
          action: escapeAction,
        },
        {
          key: "enter",
          action: enterAction,
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      // Create an input element
      const input = document.createElement("input");
      document.body.appendChild(input);
      input.focus();

      // Test escape
      act(() => {
        const escapeEvent = new KeyboardEvent("keydown", {
          key: "Escape",
          bubbles: true,
        });
        Object.defineProperty(escapeEvent, "target", {
          value: input,
          enumerable: true,
        });
        document.dispatchEvent(escapeEvent);
      });

      // Test enter
      act(() => {
        const enterEvent = new KeyboardEvent("keydown", {
          key: "Enter",
          bubbles: true,
        });
        Object.defineProperty(enterEvent, "target", {
          value: input,
          enumerable: true,
        });
        document.dispatchEvent(enterEvent);
      });

      expect(escapeAction).toHaveBeenCalledTimes(1);
      expect(enterAction).toHaveBeenCalledTimes(1);

      // Cleanup
      document.body.removeChild(input);
    });
  });

  describe("preventDefault handling", () => {
    it("should prevent default behavior by default", () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: "n",
          metaKey: true,
          action: mockAction,
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      const event = new KeyboardEvent("keydown", {
        key: "n",
        metaKey: true,
        bubbles: true,
      });
      const preventDefaultSpy = vi.spyOn(event, "preventDefault");

      act(() => {
        document.dispatchEvent(event);
      });

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(mockAction).toHaveBeenCalledTimes(1);
    });

    it("should not prevent default when preventDefault is false", () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: "n",
          metaKey: true,
          action: mockAction,
          preventDefault: false,
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      const event = new KeyboardEvent("keydown", {
        key: "n",
        metaKey: true,
        bubbles: true,
      });
      const preventDefaultSpy = vi.spyOn(event, "preventDefault");

      act(() => {
        document.dispatchEvent(event);
      });

      expect(preventDefaultSpy).not.toHaveBeenCalled();
      expect(mockAction).toHaveBeenCalledTimes(1);
    });
  });

  describe("target element handling", () => {
    it("should only listen to specific target element when provided", () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: "n",
          metaKey: true,
          action: mockAction,
        },
      ];

      const targetElement = document.createElement("div");
      document.body.appendChild(targetElement);

      renderHook(() =>
        useKeyboardShortcuts(shortcuts, { targetElement, enableGlobal: false })
      );

      // Event on target element should trigger
      act(() => {
        const event = new KeyboardEvent("keydown", {
          key: "n",
          metaKey: true,
          bubbles: true,
        });
        targetElement.dispatchEvent(event);
      });

      expect(mockAction).toHaveBeenCalledTimes(1);

      // Event on document should not trigger
      mockAction.mockClear();
      act(() => {
        const event = new KeyboardEvent("keydown", {
          key: "n",
          metaKey: true,
          bubbles: true,
        });
        document.dispatchEvent(event);
      });

      expect(mockAction).not.toHaveBeenCalled();

      // Cleanup
      document.body.removeChild(targetElement);
    });
  });

  describe("case insensitivity", () => {
    it("should handle keys case insensitively", () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: "N", // uppercase in shortcut definition
          metaKey: true,
          action: mockAction,
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      // Send lowercase 'n'
      act(() => {
        const event = new KeyboardEvent("keydown", {
          key: "n",
          metaKey: true,
          bubbles: true,
        });
        document.dispatchEvent(event);
      });

      expect(mockAction).toHaveBeenCalledTimes(1);
    });
  });

  describe("multiple shortcuts", () => {
    it("should handle multiple shortcuts and call first match only", () => {
      const action1 = vi.fn();
      const action2 = vi.fn();

      const shortcuts: KeyboardShortcut[] = [
        {
          key: "n",
          metaKey: true,
          action: action1,
        },
        {
          key: "n",
          metaKey: true,
          action: action2,
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      act(() => {
        const event = new KeyboardEvent("keydown", {
          key: "n",
          metaKey: true,
          bubbles: true,
        });
        document.dispatchEvent(event);
      });

      expect(action1).toHaveBeenCalledTimes(1);
      expect(action2).not.toHaveBeenCalled();
    });

    it("should handle different shortcuts correctly", () => {
      const action1 = vi.fn();
      const action2 = vi.fn();

      const shortcuts: KeyboardShortcut[] = [
        {
          key: "n",
          metaKey: true,
          action: action1,
        },
        {
          key: "k",
          metaKey: true,
          action: action2,
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      // Test first shortcut
      act(() => {
        const event = new KeyboardEvent("keydown", {
          key: "n",
          metaKey: true,
          bubbles: true,
        });
        document.dispatchEvent(event);
      });

      // Test second shortcut
      act(() => {
        const event = new KeyboardEvent("keydown", {
          key: "k",
          metaKey: true,
          bubbles: true,
        });
        document.dispatchEvent(event);
      });

      expect(action1).toHaveBeenCalledTimes(1);
      expect(action2).toHaveBeenCalledTimes(1);
    });
  });

  describe("GTD_SHORTCUTS constants", () => {
    it("should have all expected GTD shortcuts defined", () => {
      expect(GTD_SHORTCUTS.QUICK_CAPTURE).toEqual({
        key: "n",
        metaKey: true,
        description: "Quick capture (⌘+N)",
      });

      expect(GTD_SHORTCUTS.DETAILED_CAPTURE).toEqual({
        key: "n",
        metaKey: true,
        shiftKey: true,
        description: "Detailed capture (⌘+Shift+N)",
      });

      expect(GTD_SHORTCUTS.SEARCH).toEqual({
        key: "k",
        metaKey: true,
        description: "Search (⌘+K)",
      });

      expect(GTD_SHORTCUTS.ESCAPE).toEqual({
        key: "escape",
        description: "Close/Cancel (Esc)",
      });

      expect(GTD_SHORTCUTS.SAVE).toEqual({
        key: "enter",
        metaKey: true,
        description: "Save (⌘+Enter)",
      });

      expect(GTD_SHORTCUTS.NEXT_ACTION).toEqual({
        key: "1",
        metaKey: true,
        description: "Next Actions (⌘+1)",
      });

      expect(GTD_SHORTCUTS.PROJECTS).toEqual({
        key: "2",
        metaKey: true,
        description: "Projects (⌘+2)",
      });

      expect(GTD_SHORTCUTS.WAITING_FOR).toEqual({
        key: "3",
        metaKey: true,
        description: "Waiting For (⌘+3)",
      });

      expect(GTD_SHORTCUTS.SOMEDAY).toEqual({
        key: "4",
        metaKey: true,
        description: "Someday/Maybe (⌘+4)",
      });

      expect(GTD_SHORTCUTS.REVIEW).toEqual({
        key: "r",
        metaKey: true,
        description: "Review (⌘+R)",
      });
    });
  });

  describe("cleanup", () => {
    it("should clean up event listeners on unmount", () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: "n",
          metaKey: true,
          action: mockAction,
        },
      ];

      const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");

      const { unmount } = renderHook(() => useKeyboardShortcuts(shortcuts));

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "keydown",
        expect.any(Function)
      );
    });
  });
});
