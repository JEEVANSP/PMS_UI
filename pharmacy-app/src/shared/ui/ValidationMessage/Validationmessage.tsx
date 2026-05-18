import { AlertCircle, Info, CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "@shared/lib/cn";
import type React from "react";

type AlertType = "error" | "warning" | "success" | "info";

const alertConfig: Record<
  AlertType,
  { styles: string; icon: React.ReactNode }
> = {
  error: {
    styles: "text-red-600",
    icon: <AlertCircle size={16} />,
  },
  warning: {
    styles: "text-yellow-600",
    icon: <AlertTriangle size={16} />,
  },
  success: {
    styles: "text-green-600",
    icon: <CheckCircle size={16} />,
  },
  info: {
    styles: "text-blue-600",
    icon: <Info size={16} />,
  },
};

type AlertMessageProps = React.HTMLAttributes<HTMLDivElement> & {
  message?: string;
  type?: AlertType;
};

export default function AlertMessage({
  message = "",
  type = "error",
  className,
  ...props
}: AlertMessageProps) {
  if (!message) return null;

  const config = alertConfig[type];

  return (
    <div
      role="alert"
      className={cn("flex items-center gap-1 text-sm mt-1", config.styles, className)}
      {...props}
    >
      {config.icon}
      <span>{message}</span>
    </div>
  );
}

export { AlertMessage as ValidationMessage };
