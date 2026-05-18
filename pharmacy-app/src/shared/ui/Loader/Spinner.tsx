/**
 * Spinner component - rotating loading indicator
 */

import React from "react";
import { cn } from "@shared/lib/cn";

export type SpinnerSize = "sm" | "md" | "lg";

export interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
  "aria-label"?: string;
  "data-testid"?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: "w-6 h-6 border-2",
  md: "w-8 h-8 border-2",
  lg: "w-12 h-12 border-4",
};

/**
 * Spinner component - just the spinning circle
 * Use PageLoader or InlineLoader for full-featured loaders
 */
export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = "md", className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "border-gray-200 border-t-blue-500 rounded-full animate-spin",
        sizeClasses[size],
        className
      )}
      role="status"
      aria-live="polite"
      {...props}
    />
  )
);

Spinner.displayName = "Spinner";

export default Spinner;
