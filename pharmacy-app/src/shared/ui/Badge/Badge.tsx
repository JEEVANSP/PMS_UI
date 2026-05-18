import React from "react";
import { cn } from "@shared/lib/cn";
import { badgeVariants, badgeBase, type BadgeVariant } from "./badge.styles";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  label?: React.ReactNode;
};

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = "default", label, children, className, ...props }, ref) => (
    <span
      ref={ref}
      role="status"
      className={cn(badgeBase, badgeVariants[variant], className)}
      {...props}
    >
      {children ?? label}
    </span>
  )
);

Badge.displayName = "Badge";

export default Badge;
