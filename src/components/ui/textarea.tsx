import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] sm:min-h-[80px] w-full rounded-brand-md border border-brand-gray-300 bg-background px-3 py-3 sm:py-2 text-base sm:text-brand-base ring-offset-background placeholder:text-brand-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2 focus-visible:border-brand-teal hover:border-brand-gray-400 transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-brand-gray-50 resize-y md:text-brand-sm",
        // Prevent iOS zoom on textarea focus
        "text-[16px] sm:text-[14px] md:text-[16px]",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
