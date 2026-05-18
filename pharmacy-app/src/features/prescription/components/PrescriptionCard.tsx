import React from "react";
import { cn } from "@shared/lib/cn";
import Button from "@shared/ui/Button/Button";
import Badge from "@shared/ui/Badge/Badge";
import {
  prescriptionStatusConfig,
  type PrescriptionStatus,
  isPrescriptionStatus,
} from "./prescriptionCard.constants";

interface PrescriptionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  rxId: string;
  patientName: string;
  timestamp: string;
  itemCount?: number;
  status?: PrescriptionStatus;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  onViewDetails?: () => void;
}

const PrescriptionCard = React.forwardRef<
  HTMLDivElement,
  PrescriptionCardProps
>(
  (
    {
      rxId,
      patientName,
      timestamp,
      itemCount,
      status,
      primaryActionLabel,
      onPrimaryAction,
      onViewDetails,
      className,
      ...props
    },
    ref
  ) => {
    const statusConfig =
      status && isPrescriptionStatus(status)
        ? prescriptionStatusConfig[status]
        : null;

    return (
      <div
        ref={ref}
        className={cn(
          "p-4 bg-white rounded-lg shadow-md border border-gray-200",
          className
        )}
        {...props}
      >
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-semibold text-gray-800">{patientName}</h4>
          {status && statusConfig && (
            <Badge variant="default" className={cn(statusConfig.bg, statusConfig.text, "text-xs")}>
              {status}
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-600">RX: {rxId}</p>
        <p className="text-xs text-gray-500">{timestamp}</p>
        {itemCount !== undefined && (
          <p className="text-xs text-gray-500">{itemCount} items</p>
        )}

        <div className="flex gap-2 mt-3">
          {primaryActionLabel && (
            <Button size="sm" onClick={onPrimaryAction}>
              {primaryActionLabel}
            </Button>
          )}
          {onViewDetails && (
            <Button
              size="sm"
              variant="secondary"
              onClick={onViewDetails}
            >
              View
            </Button>
          )}
        </div>
      </div>
    );
  }
);

PrescriptionCard.displayName = "PrescriptionCard";

export default PrescriptionCard;

