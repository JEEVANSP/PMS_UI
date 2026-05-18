/**
 * PageLoader component - full-page loading indicator
 */

import React from "react";
import { cn } from "@shared/lib/cn";
import { Spinner, type SpinnerSize } from "./Spinner";

export interface PageLoaderProps {
  size?: SpinnerSize;
  label?: string;
  className?: string;
  "data-testid"?: string;
}

const textSizeClasses: Record<SpinnerSize, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

/**
 * PageLoader component - centered full-page loading indicator
 * Use for loading entire pages or major sections
 */
export const PageLoader = React.forwardRef<HTMLDivElement, PageLoaderProps>(
  ({ size = "lg", label = "Loading...", className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center justify-center min-h-screen", className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-4">
        <Spinner size={size} />
        {label && (
          <p className={cn("text-gray-600", textSizeClasses[size])}>
            {label}
          </p>
        )}
      </div>
    </div>
  )
);

PageLoader.displayName = "PageLoader";

export default PageLoader;
