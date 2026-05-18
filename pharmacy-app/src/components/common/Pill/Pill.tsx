import React from "react";
import { cn } from "@shared/lib/cn";

type PillTone = "gray" | "green" | "red" | "amber" | "yellow" | "blue";

type PillProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: PillTone;
};

const toneClasses: Record<PillTone, string> = {
  gray: "bg-gray-100 text-gray-700",
  green: "bg-green-100 text-green-800",
  red: "bg-red-100 text-red-800",
  amber: "bg-amber-100 text-amber-800",
  yellow: "bg-yellow-100 text-yellow-800",
  blue: "bg-blue-100 text-blue-800",
};

export function Pill({ tone = "gray", className, ...props }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
