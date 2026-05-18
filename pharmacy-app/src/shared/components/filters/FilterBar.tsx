import React from "react";
import { cn } from "@shared/lib/cn";

interface FilterBarProps extends React.HTMLAttributes<HTMLDivElement> {
  actions?: React.ReactNode;
}

const FilterBar = React.forwardRef<HTMLDivElement, FilterBarProps>(
  ({ children, actions, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-between p-3 bg-white rounded-lg shadow mb-4",
        className
      )}
      {...props}
    >
      <div className="flex-1">{children}</div>
      {actions && <div className="ml-4">{actions}</div>}
    </div>
  )
);

FilterBar.displayName = "FilterBar";

export default FilterBar;
