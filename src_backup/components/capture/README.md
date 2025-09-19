# GTD Task Capture System

This directory contains the complete task capture interface for the GTD application, designed for speed, mobile-first interactions, and optimal user experience.

## Components

### CaptureInput

The main quick capture component with auto-save functionality.

```tsx
import { CaptureInput } from "@/components/capture";

<CaptureInput
  onTaskCapture={async (title) => {
    // Handle quick task creation
    await createTask({ title, status: "captured" });
  }}
  onDetailedCapture={() => {
    // Open detailed capture modal
    setShowModal(true);
  }}
  placeholder="What's on your mind?"
  autoFocus={true}
/>;
```

### QuickCaptureModal

Detailed task entry modal with status selection.

```tsx
import { QuickCaptureModal } from "@/components/capture";

<QuickCaptureModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onTaskCreate={async (taskData) => {
    await createTask(taskData);
  }}
  initialTitle="Pre-filled title"
/>;
```

### CaptureContainer

Complete capture interface with status, keyboard shortcuts, and offline support.

```tsx
import { CaptureContainer } from "@/components/capture";

<CaptureContainer alwaysVisible={true} autoFocus={false} showStatus={true} />;
```

## Hooks

### useTasks

Real-time task management with Supabase integration.

```tsx
import { useTasks } from "@/hooks/useTasks";

const {
  tasks,
  loading,
  error,
  createTask,
  updateTask,
  deleteTask,
  optimisticAdd,
} = useTasks({
  autoRefresh: true,
  realTimeSync: true,
});
```

### useTaskCapture

Capture-specific functionality with offline support.

```tsx
import { useTaskCapture } from "@/hooks/useTaskCapture";

const {
  isOnline,
  isSaving,
  captureTask,
  quickCapture,
  offlineQueueCount,
  syncOfflineQueue,
} = useTaskCapture({
  enableOfflineQueue: true,
});
```

### useKeyboardShortcuts

Global keyboard shortcut management.

```tsx
import {
  useKeyboardShortcuts,
  GTD_SHORTCUTS,
} from "@/hooks/useKeyboardShortcuts";

useKeyboardShortcuts([
  {
    ...GTD_SHORTCUTS.QUICK_CAPTURE,
    action: () => focusCaptureInput(),
  },
  {
    ...GTD_SHORTCUTS.DETAILED_CAPTURE,
    action: () => openDetailedModal(),
  },
]);
```

## Features

### Performance

- **Sub-5 second capture time**: Optimized for speed
- **Auto-save**: Saves automatically 2 seconds after user stops typing
- **Optimistic UI**: Immediate feedback before server response
- **Real-time sync**: Live updates across devices

### Mobile-First

- **Thumb-friendly interactions**: Large touch targets
- **Mobile keyboard shortcuts**: Touch-optimized shortcuts
- **Responsive design**: Works on all screen sizes
- **Gesture support**: Swipe and tap interactions

### Offline Support

- **Offline queue**: Tasks saved locally when offline
- **Auto-sync**: Automatic sync when connection restored
- **Visual indicators**: Clear online/offline status
- **Error handling**: Graceful degradation

### Accessibility

- **Keyboard navigation**: Full keyboard support
- **Screen reader friendly**: Proper ARIA labels
- **High contrast**: Accessible color schemes
- **Focus management**: Logical tab order

## Keyboard Shortcuts

- `⌘+N` / `Ctrl+N`: Focus quick capture input
- `⌘+Shift+N` / `Ctrl+Shift+N`: Open detailed capture modal
- `Enter`: Save current task
- `⌘+Enter` / `Ctrl+Enter`: Save and close modal
- `Escape`: Cancel/clear current input
- `Shift+Tab`: Open detailed capture from input

## Integration Example

```tsx
// In your main layout or dashboard
import { CaptureContainer } from "@/components/capture";

export default function Dashboard() {
  return (
    <div className="min-h-screen">
      {/* Sticky header with capture */}
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <CaptureContainer
            alwaysVisible={true}
            showStatus={true}
            className="max-w-2xl"
          />
        </div>
      </header>

      {/* Rest of your content */}
      <main>{/* Dashboard content */}</main>
    </div>
  );
}
```

## Best Practices

1. **Always visible**: Keep capture input visible at the top of every page
2. **Auto-focus sparingly**: Only auto-focus on dedicated capture pages
3. **Show status**: Always show connection and save status
4. **Error handling**: Provide clear error messages and retry options
5. **Mobile optimization**: Test on real mobile devices
6. **Keyboard support**: Ensure all functionality works with keyboard only
7. **Performance monitoring**: Track capture completion times
8. **Offline testing**: Test offline scenarios regularly

## Styling

The capture system uses Tailwind CSS with a design system that includes:

- **Consistent spacing**: Uses design system spacing scale
- **Responsive typography**: Mobile-first typography scaling
- **Status colors**: Semantic colors for different states
- **Smooth animations**: Subtle transitions for state changes
- **Card-based layout**: Consistent card design patterns

All components are designed to work with both light and dark themes and automatically adapt to the user's system preferences.
