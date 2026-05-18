import React from "react";
import { cn } from "@shared/lib/cn";

export type LogoProps = React.HTMLAttributes<HTMLDivElement> & {
  icon?: React.ReactNode;
  title?: string;
  subtitle?: string;
  showText?: boolean;
  direction?: "vertical" | "horizontal";
  size?: number;
};

const Logo = React.forwardRef<HTMLDivElement, LogoProps>(
  (
    {
      icon,
      title = "PharmaCare",
      subtitle,
      showText = true,
      direction = "vertical",
      size = 40,
      className,
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-2",
        direction === "vertical" ? "flex-col text-center" : "flex-row",
        className
      )}
      {...props}
    >
      {icon && (
        <span
          className="inline-flex items-center justify-center"
          style={{ width: size, height: size, fontSize: size }}
        >
          {icon}
        </span>
      )}

      {showText && (title || subtitle) && (
        <span className="flex flex-col leading-tight">
          {title && <span className="font-semibold text-gray-900">{title}</span>}
          {subtitle && <span className="text-xs text-gray-500">{subtitle}</span>}
        </span>
      )}
    </div>
  )
);

Logo.displayName = "Logo";

export default Logo;
