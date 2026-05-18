import React from "react";
import { cn } from "@shared/lib/cn";
import { Card, CardContent } from "@shared/ui/Card/Card";

type SummaryCardProps = React.HTMLAttributes<HTMLDivElement> & {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  footer?: string;
};

const SummaryCard = React.forwardRef<HTMLDivElement, SummaryCardProps>(
  ({ title, value, icon, footer, className, ...props }, ref) => (
    <Card ref={ref} className={cn("", className)} {...props}>
      <CardContent className="flex items-center gap-4 p-4">
        {icon && <div className="text-blue-600 text-xl">{icon}</div>}
        <div className="flex flex-col">
          <span className="text-gray-500 text-sm">{title}</span>
          <span className="text-2xl font-bold">{value}</span>
          {footer && <span className="text-green-600 text-sm">{footer}</span>}
        </div>
      </CardContent>
    </Card>
  )
);

SummaryCard.displayName = "SummaryCard";

export default SummaryCard;

