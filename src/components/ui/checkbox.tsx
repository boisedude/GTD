"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer min-h-[44px] min-w-[44px] sm:h-4 sm:w-4 h-5 w-5 shrink-0 rounded-brand-sm border border-brand-gray-300 bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2 hover:border-brand-gray-400 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-brand-gray-50 data-[state=checked]:bg-brand-teal data-[state=checked]:text-brand-white data-[state=checked]:border-brand-teal data-[state=checked]:shadow-sm active:scale-95 touch-manipulation",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn(
        "flex items-center justify-center text-current transition-transform duration-200 data-[state=checked]:scale-100 data-[state=unchecked]:scale-0"
      )}
    >
      <Check className="sm:h-4 sm:w-4 h-4 w-4 font-medium" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
