/**
 * Brand Showcase Component
 *
 * Demonstrates the ClarityDone design system usage.
 * This is an example component showing how to use the brand colors,
 * typography, and design tokens in practice.
 */

import { BRAND } from "@/lib/brand";
import Image from 'next/image';

export function BrandShowcase() {
  return (
    <div className="p-8 space-y-8 bg-background">
      {/* Brand Header */}
      <header className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-4">
          <Image
            src="/logo.png"
            alt="ClarityDone Logo"
            width={64}
            height={64}
            className="h-16 w-16 object-contain"
          />
          <div>
            <h1 className="text-brand-4xl font-bold text-brand-navy">
              {BRAND.name}
            </h1>
            <p className="text-brand-xl text-brand-teal font-medium">
              {BRAND.tagline}
            </p>
          </div>
        </div>
        <p className="text-brand-base text-brand-gray-600 max-w-2xl mx-auto">
          {BRAND.description}
        </p>
        <p className="text-brand-sm text-brand-gray-500 italic">
          {BRAND.disclaimer}
        </p>
      </header>

      {/* Color Palette */}
      <section className="space-y-6">
        <h2 className="text-brand-2xl font-semibold text-brand-navy">
          Color Palette
        </h2>

        {/* Primary Colors */}
        <div className="space-y-4">
          <h3 className="text-brand-lg font-medium text-brand-gray-700">
            Primary Colors
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <div className="h-16 w-full bg-brand-navy rounded-brand-lg shadow-brand"></div>
              <p className="text-brand-sm font-medium">Navy</p>
              <code className="text-brand-xs text-brand-gray-500">
                {BRAND.colors.navy.DEFAULT}
              </code>
            </div>
            <div className="space-y-2">
              <div className="h-16 w-full bg-brand-teal rounded-brand-lg shadow-brand"></div>
              <p className="text-brand-sm font-medium">Teal</p>
              <code className="text-brand-xs text-brand-gray-500">
                {BRAND.colors.teal.DEFAULT}
              </code>
            </div>
            <div className="space-y-2">
              <div className="h-16 w-full bg-success rounded-brand-lg shadow-brand border border-brand-gray-200"></div>
              <p className="text-brand-sm font-medium">Success</p>
              <code className="text-brand-xs text-brand-gray-500">
                {BRAND.colors.success.DEFAULT}
              </code>
            </div>
            <div className="space-y-2">
              <div className="h-16 w-full bg-warning rounded-brand-lg shadow-brand"></div>
              <p className="text-brand-sm font-medium">Warning</p>
              <code className="text-brand-xs text-brand-gray-500">
                {BRAND.colors.warning.DEFAULT}
              </code>
            </div>
            <div className="space-y-2">
              <div className="h-16 w-full bg-error rounded-brand-lg shadow-brand"></div>
              <p className="text-brand-sm font-medium">Error</p>
              <code className="text-brand-xs text-brand-gray-500">
                {BRAND.colors.error.DEFAULT}
              </code>
            </div>
          </div>
        </div>

        {/* Gray Scale */}
        <div className="space-y-4">
          <h3 className="text-brand-lg font-medium text-brand-gray-700">
            Gray Scale
          </h3>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {Object.entries(BRAND.colors.gray).map(([shade, color]) => (
              <div key={shade} className="space-y-2">
                <div
                  className="h-12 w-full rounded-brand-md border border-brand-gray-200"
                  style={{ backgroundColor: color }}
                ></div>
                <p className="text-brand-xs font-medium">{shade}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Typography */}
      <section className="space-y-6">
        <h2 className="text-brand-2xl font-semibold text-brand-navy">
          Typography
        </h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-brand-6xl font-bold text-brand-navy">
              Heading 1 - Hero Title
            </h1>
            <p className="text-brand-sm text-brand-gray-500">
              font-size: {BRAND.typography.sizes["6xl"]} | font-weight:{" "}
              {BRAND.typography.weights.bold}
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-brand-4xl font-semibold text-brand-navy">
              Heading 2 - Section Title
            </h2>
            <p className="text-brand-sm text-brand-gray-500">
              font-size: {BRAND.typography.sizes["4xl"]} | font-weight:{" "}
              {BRAND.typography.weights.semibold}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-brand-2xl font-medium text-brand-navy">
              Heading 3 - Subsection
            </h3>
            <p className="text-brand-sm text-brand-gray-500">
              font-size: {BRAND.typography.sizes["2xl"]} | font-weight:{" "}
              {BRAND.typography.weights.medium}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-brand-base text-brand-gray-700 leading-brand-normal">
              Body text - This is the standard body text used throughout the
              application. It provides excellent readability and follows our
              brand guidelines for clear communication.
            </p>
            <p className="text-brand-sm text-brand-gray-500">
              font-size: {BRAND.typography.sizes.base} | line-height: normal
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-brand-sm text-brand-gray-600">
              Small text - Used for captions, metadata, and secondary
              information.
            </p>
            <p className="text-brand-sm text-brand-gray-500">
              font-size: {BRAND.typography.sizes.sm}
            </p>
          </div>
        </div>
      </section>

      {/* Component Examples */}
      <section className="space-y-6">
        <h2 className="text-brand-2xl font-semibold text-brand-navy">
          Component Examples
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Primary Button */}
          <div className="space-y-3">
            <h4 className="text-brand-base font-medium text-brand-gray-700">
              Primary Button
            </h4>
            <button className="px-6 py-3 bg-brand-teal hover:bg-brand-teal-dark text-white font-medium rounded-brand-lg transition-colors duration-200 shadow-brand">
              Add Task
            </button>
          </div>

          {/* Secondary Button */}
          <div className="space-y-3">
            <h4 className="text-brand-base font-medium text-brand-gray-700">
              Secondary Button
            </h4>
            <button className="px-6 py-3 bg-brand-gray-100 hover:bg-brand-gray-200 text-brand-navy font-medium rounded-brand-lg transition-colors duration-200 border border-brand-gray-200">
              Cancel
            </button>
          </div>

          {/* Card */}
          <div className="space-y-3">
            <h4 className="text-brand-base font-medium text-brand-gray-700">
              Task Card
            </h4>
            <div className="p-4 bg-white border border-brand-gray-200 rounded-brand-lg shadow-brand hover:shadow-brand-lg transition-shadow duration-200">
              <h5 className="font-medium text-brand-navy mb-2">
                Review project proposal
              </h5>
              <p className="text-brand-sm text-brand-gray-600 mb-3">
                Go through the Q4 project proposal and provide feedback.
              </p>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-brand-teal/10 text-brand-teal text-brand-xs rounded-brand-md">
                  @computer
                </span>
                <span className="px-2 py-1 bg-warning/10 text-warning text-brand-xs rounded-brand-md">
                  High Priority
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Usage Examples */}
      <section className="space-y-6">
        <h2 className="text-brand-2xl font-semibold text-brand-navy">
          Usage in Code
        </h2>

        <div className="bg-brand-gray-50 p-6 rounded-brand-lg border border-brand-gray-200">
          <h4 className="text-brand-base font-medium text-brand-gray-700 mb-4">
            Example: Using Brand Colors
          </h4>
          <pre className="text-brand-sm text-brand-gray-700 font-mono bg-white p-4 rounded-brand-md border border-brand-gray-200 overflow-x-auto">
            {`// Using Tailwind classes
<div className="bg-brand-teal text-white">
  Primary action
</div>

// Using CSS custom properties
<div style={{
  backgroundColor: 'hsl(var(--brand-teal))',
  color: 'hsl(var(--brand-white))'
}}>
  Primary action
</div>

// Using brand constants
import { BRAND } from '@/lib/brand';
<div style={{
  backgroundColor: BRAND.colors.teal.DEFAULT
}}>
  Primary action
</div>`}
          </pre>
        </div>
      </section>
    </div>
  );
}
