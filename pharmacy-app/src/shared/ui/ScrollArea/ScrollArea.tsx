import React from "react";
import { cn } from "@shared/lib/cn";

type ScrollAreaProps = React.HTMLAttributes<HTMLDivElement> & {
  height?: React.CSSProperties["height"];
  width?: React.CSSProperties["width"];
};

export default function ScrollArea({
  className,
  height,
  width,
  style,
  ...props
}: ScrollAreaProps) {
  return (
    <div
      className={cn(
        "relative overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent",
        className
      )}
      style={{ height, width, ...style }}
      {...props}
    />
  );
}
