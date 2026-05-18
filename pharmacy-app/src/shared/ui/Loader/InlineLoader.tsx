/**
 * InlineLoader component - inline loading indicator for buttons, tables, etc.
 */

import React from "react";
import { cn } from "@shared/lib/cn";
import { Spinner, type SpinnerSize } from "./Spinner";

export interface InlineLoaderProps {
  size?: SpinnerSize;
  label?: string;
  className?: string;
  "data-testid"?: string;
}

/**
 * InlineLoader component - inline loading indicator
 * Use for buttons, list items, table rows, etc.
 */
export const InlineLoader = React.forwardRef<HTMLDivElement, InlineLoaderProps>(
  ({ size = "md", label, className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center gap-2", className)} {...props}>
      <Spinner size={size} />
      {label && <span className="text-gray-600 text-sm">{label}</span>}
    </div>
  )
);

InlineLoader.displayName = "InlineLoader";

export default InlineLoader;
