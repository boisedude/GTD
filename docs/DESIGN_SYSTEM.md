# ClarityDone Design System

This document outlines the comprehensive design system for **ClarityDone**, a GTD-inspired productivity application with the tagline "Calm. Clear. Done."

## 🎨 Brand Identity

- **Name**: ClarityDone
- **Tagline**: "Calm. Clear. Done."
- **Style**: Modern, clean, professional, calming
- **Focus**: GTD productivity methodology with a disclaimer that it's inspired by but not affiliated with GTD®

## 📁 File Structure

The design system is organized across several key files:

```
src/
├── styles/
│   └── design-tokens.css          # CSS custom properties and design tokens
├── lib/
│   └── brand.ts                   # TypeScript brand constants and utilities
├── app/
│   └── globals.css                # Global styles with ClarityDone branding
├── components/
│   └── examples/
│       └── BrandShowcase.tsx      # Demo component showing design system usage
├── tailwind.config.ts             # Tailwind configuration with brand extensions
└── public/
    └── logo.png                   # Main ClarityDone logo
```

## 🎯 Core Colors

### Primary Brand Colors

- **Navy**: `#1e293b` (HSL: 30 41 59) - Primary text and backgrounds
- **Teal**: `#06b6d4` (HSL: 6 182 212) - Primary accent color for actions and highlights
- **White**: `#ffffff` - Clean backgrounds and text on dark surfaces

### Gray Scale

A comprehensive 10-step gray scale from `gray-50` to `gray-900` based on the brand navy, providing subtle variations for backgrounds, borders, and secondary text.

### Semantic Colors

- **Success**: `#22c55e` - Confirmation, completed tasks
- **Warning**: `#f59e0b` - Alerts, pending items
- **Error**: `#ef4444` - Errors, destructive actions
- **Info**: `#06b6d4` - Informational content (uses brand teal)

## 📝 Typography

### Font Stack

- **Primary**: Inter with system font fallbacks
- **Heading**: Inter (same as primary for consistency)
- **Monospace**: JetBrains Mono with code font fallbacks

### Size Scale

- **xs**: 12px - Small labels, metadata
- **sm**: 14px - Secondary text, captions
- **base**: 16px - Body text (default)
- **lg**: 18px - Emphasized body text
- **xl**: 20px - Small headings
- **2xl**: 24px - Section headings
- **3xl**: 30px - Page headings
- **4xl**: 36px - Large headings
- **5xl**: 48px - Hero text
- **6xl**: 60px - Display text

### Weight Scale

- **Light**: 300
- **Normal**: 400 (default)
- **Medium**: 500
- **Semibold**: 600 (headings)
- **Bold**: 700
- **Extrabold**: 800

## 📐 Spacing & Layout

### Spacing Scale

Based on 4px increments using CSS custom properties:

- `--space-1` through `--space-64` (4px to 256px)

### Border Radius

- **sm**: 2px - Small elements
- **base**: 4px - Inputs, small buttons
- **md**: 6px - Cards, moderate elements
- **lg**: 8px - Primary buttons, cards
- **xl**: 12px - Large cards
- **2xl**: 16px - Hero elements
- **3xl**: 24px - Major containers

### Shadows

- **brand**: Subtle teal-tinted shadow for brand elements
- **brand-lg**: Larger teal-tinted shadow for elevated elements
- Standard shadow scale from `xs` to `2xl`

## 🔧 Usage

### 1. Using CSS Custom Properties

```css
.element {
  background-color: hsl(var(--brand-teal));
  color: hsl(var(--brand-white));
  border-radius: var(--radius-lg);
  padding: var(--space-4);
}
```

### 2. Using Tailwind Classes

```jsx
<div className="bg-brand-teal text-white rounded-brand-lg p-4">
  Primary action
</div>
```

### 3. Using TypeScript Constants

```tsx
import { BRAND } from "@/lib/brand";

<div
  style={{
    backgroundColor: BRAND.colors.teal.DEFAULT,
    color: BRAND.colors.white,
  }}
>
  Styled element
</div>;
```

### 4. Using Brand Utilities

```tsx
import { getBrandTitle, getBrandColorHsl } from "@/lib/brand";

// For page titles
const pageTitle = getBrandTitle("Dashboard");

// For dynamic styles
const dynamicStyle = {
  color: getBrandColorHsl("navy"),
};
```

## 🌗 Dark Mode

The design system includes comprehensive dark mode support:

- Automatic color inversion for gray scales
- Maintained brand color integrity
- Enhanced shadow contrast for dark backgrounds
- Preserved accessibility contrast ratios

Enable dark mode by adding the `dark` class to any parent element.

## ♿ Accessibility

### Focus States

- Custom focus rings using brand teal
- 2px offset for clear visibility
- High contrast ratios maintained

### Color Contrast

All color combinations meet WCAG 2.1 AA standards:

- Text on backgrounds: minimum 4.5:1 ratio
- Large text: minimum 3:1 ratio
- Interactive elements: clear visual distinction

### Typography

- Base font size of 16px for readability
- Appropriate line heights for comfortable reading
- Scalable typography using relative units

## 🏗️ Component Guidelines

### Buttons

- **Primary**: `bg-brand-teal` with white text
- **Secondary**: `bg-brand-gray-100` with navy text
- **Destructive**: `bg-error` with white text

### Cards

- White background with subtle border
- `rounded-brand-lg` corners
- `shadow-brand` for subtle elevation

### Form Elements

- Consistent `border-brand-gray-200`
- Focus states with `ring-brand-teal`
- Appropriate padding and sizing

### Navigation

- Navy background for primary navigation
- Teal accents for active states
- Clean typography hierarchy

## 📱 Responsive Design

The design system includes responsive breakpoints:

- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

All components should be designed mobile-first, following the project's mobile-first philosophy.

## 🚀 Getting Started

1. **Import the design tokens**: The `design-tokens.css` file is automatically imported in `globals.css`

2. **Use the brand constants**: Import from `@/lib/brand` for TypeScript usage

3. **Follow the color system**: Use the provided color variables instead of hardcoded values

4. **Test in both modes**: Ensure components work in both light and dark themes

5. **Maintain consistency**: Stick to the defined spacing, typography, and color scales

## 📊 Example Component

See `src/components/examples/BrandShowcase.tsx` for a comprehensive demonstration of all design system elements in practice.

---

_This design system ensures consistent, accessible, and beautiful user interfaces across the entire ClarityDone application while maintaining the calm, clear, and efficient brand identity._
