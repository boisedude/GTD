// Enhanced TypeScript definitions for shadcn/ui components
// Optimized for Clarity Done GTD Application

import type { VariantProps } from "class-variance-authority";
import type { buttonVariants, badgeVariants } from "./";

// Common component props
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Enhanced Button Props with GTD-specific variants
export interface EnhancedButtonProps extends BaseComponentProps {
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
  asChild?: boolean;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// Enhanced Badge Props with GTD status variants
export interface EnhancedBadgeProps extends BaseComponentProps {
  variant?: VariantProps<typeof badgeVariants>["variant"];
  pulse?: boolean;
  removable?: boolean;
  onRemove?: () => void;
}

// Mobile-optimized touch target sizes
export const MOBILE_TOUCH_TARGET = "min-h-[44px] min-w-[44px]";
export const DESKTOP_COMPACT = "sm:h-auto sm:w-auto";

// Animation timings optimized for calm experience
export const ANIMATION_DURATIONS = {
  fast: "duration-150",
  normal: "duration-200",
  slow: "duration-300",
  brand: "duration-200", // Brand standard
} as const;

// Focus states with brand colors
export const FOCUS_STYLES =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2";

// Hover states with smooth transitions
export const HOVER_STYLES =
  "hover:bg-brand-gray-50 transition-colors duration-200";

// GTD-specific component states
export type GTDTaskStatus =
  | "captured"
  | "next_action"
  | "project"
  | "waiting_for"
  | "someday"
  | "completed";

export type GTDPriority = "high" | "medium" | "low";

export interface GTDStatusProps {
  status: GTDTaskStatus;
  priority?: GTDPriority;
  showIcon?: boolean;
}

// Mobile responsiveness utilities
export const MOBILE_RESPONSIVE = {
  text: "text-base sm:text-brand-sm",
  padding: "py-3 sm:py-2",
  height: "min-h-[44px] sm:h-10",
  touchTarget: MOBILE_TOUCH_TARGET,
  preventZoom: "text-[16px] sm:text-[14px]", // Prevents iOS zoom
} as const;
