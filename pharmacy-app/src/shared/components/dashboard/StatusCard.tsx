import React from "react";
import { cn } from "@shared/lib/cn";
import { Card, CardContent } from "@shared/ui/Card/Card";

type StatusCardVariant = "success" | "warning" | "danger" | "default";

const variantStyles: Record<StatusCardVariant, string> = {
  success: "bg-green-50 border-green-200",
  warning: "bg-yellow-50 border-yellow-200",
  danger: "bg-red-50 border-red-200",
  default: "bg-gray-50 border-gray-200",
};

const variantTextStyles: Record<StatusCardVariant, string> = {
  success: "text-green-700",
  warning: "text-yellow-700",
  danger: "text-red-700",
  default: "text-gray-700",
};

type StatusCardProps = React.HTMLAttributes<HTMLDivElement> & {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  variant?: StatusCardVariant;
  onClick?: () => void;
};

const StatusCard = React.forwardRef<HTMLDivElement, StatusCardProps>(
  (
    {
      title,
      value,
      icon,
      variant = "default",
      className,
      ...props
    },
    ref
  ) => (
    <Card
      ref={ref}
      className={cn(
        "cursor-pointer transition-shadow hover:shadow-md",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          {icon && (
            <div className={cn("text-2xl", variantTextStyles[variant])}>
              {icon}
            </div>
          )}
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        </div>
        <span className={cn("text-2xl font-bold", variantTextStyles[variant])}>
          {value}
        </span>
      </CardContent>
    </Card>
  )
);

StatusCard.displayName = "StatusCard";

export default StatusCard;

