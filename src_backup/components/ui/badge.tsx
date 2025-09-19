import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // GTD Status variants with improved contrast
        captured:
          "border-blue-300 bg-blue-100 text-blue-900 hover:bg-blue-200",
        next_action:
          "border-orange-300 bg-orange-100 text-orange-900 hover:bg-orange-200",
        project:
          "border-purple-300 bg-purple-100 text-purple-900 hover:bg-purple-200",
        waiting_for:
          "border-yellow-300 bg-yellow-100 text-yellow-900 hover:bg-yellow-200",
        someday:
          "border-gray-300 bg-gray-100 text-gray-900 hover:bg-gray-200",
        completed:
          "border-green-300 bg-green-100 text-green-900 hover:bg-green-200",
        // Priority variants
        priority_high:
          "border-red-300 bg-red-100 text-red-900 hover:bg-red-200",
        priority_medium:
          "border-yellow-300 bg-yellow-100 text-yellow-900 hover:bg-yellow-200",
        priority_low:
          "border-blue-300 bg-blue-100 text-blue-900 hover:bg-blue-200",
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
