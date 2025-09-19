import * as React from "react";
import { cn } from "@/lib/utils";

const Skeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "animate-pulse rounded-brand-md bg-brand-gray-200 transition-colors duration-200",
        className
      )}
      {...props}
      aria-label="Loading..."
      role="status"
    />
  );
});
Skeleton.displayName = "Skeleton";

export { Skeleton };
