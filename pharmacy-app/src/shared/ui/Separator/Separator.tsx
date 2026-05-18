import React from "react";
import { cn } from "@shared/lib/cn";

type SeparatorProps = React.HTMLAttributes<HTMLDivElement> & {
  orientation?: "horizontal" | "vertical";
  variant?: "default" | "muted" | "strong";
  size?: "sm" | "md" | "lg";
};

export default function Separator({
  orientation = "horizontal",
  variant = "default",
  size = "md",
  className,
  ...props
}: SeparatorProps) {
  const orientations = {
    horizontal: "w-full",
    vertical: "h-full",
  };

  const variants = {
    default: "bg-gray-300",
    muted: "bg-gray-200",
    strong: "bg-gray-400",
  };

  const sizes = {
    sm: orientation === "horizontal" ? "h-px" : "w-px",
    md: orientation === "horizontal" ? "h-[2px]" : "w-[2px]",
    lg: orientation === "horizontal" ? "h-[4px]" : "w-[4px]",
  };

  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        "shrink-0",
        orientations[orientation],
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
