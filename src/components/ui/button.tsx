import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-brand-md text-brand-sm font-medium ring-offset-background transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98] transform-gpu",
  {
    variants: {
      variant: {
        default:
          "bg-brand-teal text-brand-white hover:bg-brand-teal-dark shadow-brand hover:shadow-brand-lg transition-shadow",
        destructive:
          "bg-error text-brand-white hover:bg-error-dark shadow-sm hover:shadow-md",
        outline:
          "border border-brand-gray-300 bg-background hover:bg-brand-gray-50 hover:border-brand-teal text-brand-navy",
        secondary:
          "bg-brand-gray-100 text-brand-navy hover:bg-brand-gray-200 shadow-sm hover:shadow-md",
        ghost:
          "hover:bg-brand-gray-100 hover:text-brand-navy text-brand-gray-700",
        link: "text-brand-teal underline-offset-4 hover:underline hover:text-brand-teal-dark",
        navy: "bg-brand-navy text-brand-white hover:bg-brand-navy-light shadow-sm hover:shadow-md",
        success:
          "bg-success text-brand-white hover:bg-success-dark shadow-sm hover:shadow-md",
        warning:
          "bg-warning text-brand-white hover:bg-warning-dark shadow-sm hover:shadow-md",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-brand-sm px-3 text-brand-xs",
        lg: "h-12 rounded-brand-lg px-6 text-brand-base font-semibold",
        xl: "h-14 rounded-brand-xl px-8 text-brand-lg font-semibold",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8 rounded-brand-sm",
        "icon-lg": "h-12 w-12 rounded-brand-lg",
        touch: "h-12 px-4 py-3 min-w-[44px] rounded-brand-lg", // Mobile-optimized 44px touch target
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
