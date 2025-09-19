/**
 * Clarity Done Brand Constants
 *
 * Centralized brand information, colors, and configuration
 * for the Clarity Done GTD productivity application.
 */

export const BRAND = {
  // === CORE BRAND INFO ===
  name: "Clarity Done" as const,
  tagline: "Calm. Clear. Done." as const,
  description:
    "A GTD-inspired productivity application that helps you capture, clarify, organize, reflect, and engage with your tasks and projects." as const,

  // Legal disclaimer
  disclaimer:
    "Inspired by GTD® principles. Not affiliated with or licensed by David Allen or GTD®." as const,

  // === BRAND COLORS (HEX) ===
  colors: {
    // Primary Brand Colors
    navy: {
      DEFAULT: "#1e293b",
      light: "#334155",
      dark: "#0f172a",
    },
    teal: {
      DEFAULT: "#06b6d4",
      light: "#22c55e",
      dark: "#0891b2",
    },
    white: "#ffffff",

    // Gray Scale
    gray: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a",
    },

    // Semantic Colors
    success: {
      DEFAULT: "#22c55e",
      light: "#4ade80",
      dark: "#15803d",
    },
    warning: {
      DEFAULT: "#f59e0b",
      light: "#fbbf24",
      dark: "#d97706",
    },
    error: {
      DEFAULT: "#ef4444",
      light: "#f87171",
      dark: "#b91c1c",
    },
    info: {
      DEFAULT: "#06b6d4",
      light: "#22d3ee",
      dark: "#0891b2",
    },
  } as const,

  // === BRAND COLORS (HSL for CSS) ===
  hsl: {
    navy: {
      DEFAULT: "30 41 59",
      light: "51 65 85",
      dark: "15 23 42",
    },
    teal: {
      DEFAULT: "6 182 212",
      light: "34 197 94",
      dark: "8 145 178",
    },
    white: "255 255 255",

    gray: {
      50: "248 250 252",
      100: "241 245 249",
      200: "226 232 240",
      300: "203 213 225",
      400: "148 163 184",
      500: "100 116 139",
      600: "71 85 105",
      700: "51 65 85",
      800: "30 41 59",
      900: "15 23 42",
    },
  } as const,

  // === TYPOGRAPHY ===
  typography: {
    fonts: {
      primary:
        "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
      heading:
        "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', 'Monaco', 'Cascadia Code', monospace",
    },

    weights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },

    sizes: {
      xs: "0.75rem", // 12px
      sm: "0.875rem", // 14px
      base: "1rem", // 16px
      lg: "1.125rem", // 18px
      xl: "1.25rem", // 20px
      "2xl": "1.5rem", // 24px
      "3xl": "1.875rem", // 30px
      "4xl": "2.25rem", // 36px
      "5xl": "3rem", // 48px
      "6xl": "3.75rem", // 60px
    },
  } as const,

  // === LAYOUT & SPACING ===
  layout: {
    spacing: {
      xs: "0.25rem", // 4px
      sm: "0.5rem", // 8px
      md: "1rem", // 16px
      lg: "1.5rem", // 24px
      xl: "2rem", // 32px
      "2xl": "3rem", // 48px
      "3xl": "4rem", // 64px
    },

    radius: {
      sm: "0.125rem", // 2px
      base: "0.25rem", // 4px
      md: "0.375rem", // 6px
      lg: "0.5rem", // 8px
      xl: "0.75rem", // 12px
      "2xl": "1rem", // 16px
      "3xl": "1.5rem", // 24px
      full: "9999px",
    },

    containers: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
  } as const,

  // === ASSETS ===
  assets: {
    logo: {
      main: "/logo.png",
      // favicon: "/favicon.ico", // TODO: Create favicon
      // logoSmall: "/logo-small.png", // TODO: Create small logo
    },
  } as const,

  // === METADATA ===
  meta: {
    title: "Clarity Done - GTD Productivity App",
    description:
      "Transform your productivity with Clarity Done, a clean and intuitive GTD-inspired task management application. Capture, clarify, organize, reflect, and engage with your work effectively.",
    keywords: [
      "GTD",
      "productivity",
      "task management",
      "getting things done",
      "organization",
      "workflow",
      "clarity",
      "focus",
    ],
    author: "Clarity Done Team",
    url: "https://claritydone.app", // TODO: Update with actual domain
  } as const,

  // === THEME CONFIGURATION ===
  theme: {
    // Default theme mode
    defaultMode: "light" as "light" | "dark",

    // Animation durations
    animation: {
      fast: "150ms",
      normal: "200ms",
      slow: "300ms",
    },

    // Z-index layers
    zIndex: {
      dropdown: 1000,
      sticky: 1020,
      fixed: 1030,
      modal: 1050,
      popover: 1060,
      tooltip: 1070,
      toast: 1080,
    },
  } as const,

  // === GTD METHODOLOGY ===
  gtd: {
    // Task statuses aligned with GTD methodology
    taskStatuses: {
      captured: "captured",
      next_action: "next_action",
      project: "project",
      waiting_for: "waiting_for",
      someday: "someday",
      reference: "reference",
      completed: "completed",
    } as const,

    // Review types
    reviewTypes: {
      daily: "daily",
      weekly: "weekly",
      monthly: "monthly",
    } as const,

    // Context types for tasks
    contexts: [
      "@calls",
      "@computer",
      "@errands",
      "@home",
      "@office",
      "@online",
      "@waiting",
    ] as const,
  } as const,
} as const;

// === TYPE EXPORTS ===
export type BrandColors = typeof BRAND.colors;
export type TaskStatus = keyof typeof BRAND.gtd.taskStatuses;
export type ReviewType = keyof typeof BRAND.gtd.reviewTypes;
export type Context = (typeof BRAND.gtd.contexts)[number];

// === UTILITY FUNCTIONS ===

/**
 * Get a CSS custom property name for a brand color
 */
export function getBrandColorVar(color: string): string {
  return `var(--brand-${color})`;
}

/**
 * Get HSL color value for use in CSS
 */
export function getBrandColorHsl(color: string): string {
  return `hsl(var(--brand-${color}))`;
}

/**
 * Format the brand tagline with proper typography
 */
export function getFormattedTagline(): string {
  return BRAND.tagline;
}

/**
 * Get the full brand title for page titles
 */
export function getBrandTitle(pageTitle?: string): string {
  return pageTitle ? `${pageTitle} | ${BRAND.name}` : BRAND.meta.title;
}

/**
 * Get brand description with disclaimer
 */
export function getBrandDescriptionWithDisclaimer(): string {
  return `${BRAND.description} ${BRAND.disclaimer}`;
}
