import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-brand-2xl border px-2.5 py-0.5 text-brand-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:ring-offset-2 shadow-sm",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-brand-teal text-brand-white hover:bg-brand-teal-dark hover:shadow-md",
        secondary:
          "border-transparent bg-brand-gray-200 text-brand-navy hover:bg-brand-gray-300",
        destructive:
          "border-transparent bg-error text-brand-white hover:bg-error-dark",
        outline: "border-brand-gray-300 text-brand-navy hover:bg-brand-gray-50",
        navy: "border-transparent bg-brand-navy text-brand-white hover:bg-brand-navy-light",
        success:
          "border-transparent bg-success text-brand-white hover:bg-success-dark",
        warning:
          "border-transparent bg-warning text-brand-white hover:bg-warning-dark",
        info: "border-transparent bg-info text-brand-white hover:bg-info-dark",

        // GTD Status variants with brand colors
        captured:
          "border-brand-teal bg-brand-teal/10 text-brand-teal hover:bg-brand-teal/20",
        next_action:
          "border-warning bg-warning/10 text-warning-dark hover:bg-warning/20",
        project:
          "border-brand-navy bg-brand-navy/10 text-brand-navy hover:bg-brand-navy/20",
        waiting_for:
          "border-brand-gray-400 bg-brand-gray-100 text-brand-gray-700 hover:bg-brand-gray-200",
        someday:
          "border-brand-gray-300 bg-brand-gray-50 text-brand-gray-600 hover:bg-brand-gray-100",
        completed:
          "border-success bg-success/10 text-success-dark hover:bg-success/20",

        // Priority variants
        priority_high:
          "border-error bg-error/10 text-error-dark hover:bg-error/20 font-semibold",
        priority_medium:
          "border-warning bg-warning/10 text-warning-dark hover:bg-warning/20",
        priority_low: "border-info bg-info/10 text-info-dark hover:bg-info/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
