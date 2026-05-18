/**
 * Individual toast item component
 */

import React from "react";
import { X } from "lucide-react";
import { cn } from "@shared/lib/cn";
import type { Toast } from "./toast.types";
import {
  getToastIcon,
  getToastContainerStyles,
  getToastTitleColor,
  getToastMessageColor,
  TOAST_ITEM_STYLES,
} from "./toast.config";

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

export const ToastItem = React.forwardRef<HTMLDivElement, ToastItemProps>(
  ({ toast, onRemove }, ref) => {
    const { id, type, title, message } = toast;

    return (
      <div
        ref={ref}
        className={cn(TOAST_ITEM_STYLES, getToastContainerStyles(type))}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        data-testid={`toast-${id}`}
      >
        {/* Icon */}
        <div className="flex-shrink-0">{getToastIcon(type)}</div>

        {/* Content */}
        <div className="flex-1">
          <h4 className={cn("font-semibold", getToastTitleColor(type))}>
            {title}
          </h4>
          {message && (
            <p className={cn("text-sm mt-1", getToastMessageColor(type))}>
              {message}
            </p>
          )}
        </div>

        {/* Close button */}
        <button
          aria-label="Close toast"
          onClick={() => onRemove(id)}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors hover:bg-white/50 rounded p-1"
          type="button"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }
);

ToastItem.displayName = "ToastItem";
