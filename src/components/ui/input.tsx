import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex min-h-[44px] sm:h-10 w-full rounded-brand-md border border-brand-gray-300 bg-background px-3 py-3 sm:py-2 text-base sm:text-brand-base ring-offset-background file:border-0 file:bg-transparent file:text-brand-sm file:font-medium file:text-foreground placeholder:text-brand-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2 focus-visible:border-brand-teal hover:border-brand-gray-400 transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-brand-gray-50 md:text-brand-sm",
          // Prevent iOS zoom on input focus
          "text-[16px] sm:text-[14px] md:text-[16px]",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
