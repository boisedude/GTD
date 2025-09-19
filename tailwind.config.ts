import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "2rem",
        lg: "4rem",
        xl: "5rem",
        "2xl": "6rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1400px",
      },
    },
    screens: {
      xs: "475px", // Extra small devices
      sm: "640px", // Small devices (large phones, 640px and up)
      md: "768px", // Medium devices (tablets, 768px and up)
      lg: "1024px", // Large devices (desktops, 1024px and up)
      xl: "1280px", // Extra large devices (large desktops, 1280px and up)
      "2xl": "1536px", // 2X large devices (larger desktops, 1536px and up)
    },
    extend: {
      colors: {
        // Shadcn UI colors (using Clarity Done brand tokens)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // Clarity Done Brand Colors
        brand: {
          navy: {
            DEFAULT: "hsl(var(--brand-navy))",
            light: "hsl(var(--brand-navy-light))",
            dark: "hsl(var(--brand-navy-dark))",
          },
          teal: {
            DEFAULT: "hsl(var(--brand-teal))",
            light: "hsl(var(--brand-teal-light))",
            dark: "hsl(var(--brand-teal-dark))",
          },
          white: "hsl(var(--brand-white))",
          gray: {
            50: "hsl(var(--brand-gray-50))",
            100: "hsl(var(--brand-gray-100))",
            200: "hsl(var(--brand-gray-200))",
            300: "hsl(var(--brand-gray-300))",
            400: "hsl(var(--brand-gray-400))",
            500: "hsl(var(--brand-gray-500))",
            600: "hsl(var(--brand-gray-600))",
            700: "hsl(var(--brand-gray-700))",
            800: "hsl(var(--brand-gray-800))",
            900: "hsl(var(--brand-gray-900))",
          },
        },

        // Semantic Colors
        success: {
          DEFAULT: "hsl(var(--color-success))",
          light: "hsl(var(--color-success-light))",
          dark: "hsl(var(--color-success-dark))",
        },
        warning: {
          DEFAULT: "hsl(var(--color-warning))",
          light: "hsl(var(--color-warning-light))",
          dark: "hsl(var(--color-warning-dark))",
        },
        error: {
          DEFAULT: "hsl(var(--color-error))",
          light: "hsl(var(--color-error-light))",
          dark: "hsl(var(--color-error-dark))",
        },
        info: {
          DEFAULT: "hsl(var(--color-info))",
          light: "hsl(var(--color-info-light))",
          dark: "hsl(var(--color-info-dark))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // Brand-specific radius tokens
        "brand-sm": "var(--radius-sm)",
        "brand-base": "var(--radius-base)",
        "brand-md": "var(--radius-md)",
        "brand-lg": "var(--radius-lg)",
        "brand-xl": "var(--radius-xl)",
        "brand-2xl": "var(--radius-2xl)",
        "brand-3xl": "var(--radius-3xl)",
      },

      spacing: {
        // Custom spacing using design tokens
        "18": "var(--space-18)", // 4.5rem / 72px
        "72": "var(--space-72)", // 18rem / 288px
        "84": "var(--space-84)", // 21rem / 336px
        "96": "var(--space-96)", // 24rem / 384px
      },

      fontFamily: {
        sans: ["var(--font-primary)"],
        heading: ["var(--font-heading)"],
        mono: ["var(--font-mono)"],
      },

      fontSize: {
        "brand-xs": "var(--font-size-xs)",
        "brand-sm": "var(--font-size-sm)",
        "brand-base": "var(--font-size-base)",
        "brand-lg": "var(--font-size-lg)",
        "brand-xl": "var(--font-size-xl)",
        "brand-2xl": "var(--font-size-2xl)",
        "brand-3xl": "var(--font-size-3xl)",
        "brand-4xl": "var(--font-size-4xl)",
        "brand-5xl": "var(--font-size-5xl)",
        "brand-6xl": "var(--font-size-6xl)",
      },

      lineHeight: {
        "brand-tight": "var(--line-height-tight)",
        "brand-snug": "var(--line-height-snug)",
        "brand-normal": "var(--line-height-normal)",
        "brand-relaxed": "var(--line-height-relaxed)",
        "brand-loose": "var(--line-height-loose)",
      },

      boxShadow: {
        brand: "var(--shadow-brand)",
        "brand-lg": "var(--shadow-brand-lg)",
      },

      transitionDuration: {
        "75": "var(--duration-75)",
        "100": "var(--duration-100)",
        "150": "var(--duration-150)",
        "200": "var(--duration-200)",
        "300": "var(--duration-300)",
        "500": "var(--duration-500)",
        "700": "var(--duration-700)",
        "1000": "var(--duration-1000)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
