/**
 * Toast configuration and helpers
 * Styles, icons, and theme mapping
 */

import React from "react";
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";
import type { ToastType } from "./toast.types";

/**
 * Icon mapping for toast types
 */
export const getToastIcon = (type: ToastType): React.ReactNode => {
  switch (type) {
    case "success":
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case "error":
      return <XCircle className="w-5 h-5 text-red-600" />;
    case "warning":
      return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    case "info":
      return <Info className="w-5 h-5 text-blue-600" />;
  }
};

/**
 * Background and border styles for toast types
 */
export const getToastContainerStyles = (type: ToastType): string => {
  switch (type) {
    case "success":
      return "bg-green-50 border-green-200";
    case "error":
      return "bg-red-50 border-red-200";
    case "warning":
      return "bg-yellow-50 border-yellow-200";
    case "info":
      return "bg-blue-50 border-blue-200";
  }
};

/**
 * Title text color for toast types
 */
export const getToastTitleColor = (type: ToastType): string => {
  switch (type) {
    case "success":
      return "text-green-900";
    case "error":
      return "text-red-900";
    case "warning":
      return "text-yellow-900";
    case "info":
      return "text-blue-900";
  }
};

/**
 * Message text color for toast types
 */
export const getToastMessageColor = (type: ToastType): string => {
  switch (type) {
    case "success":
      return "text-green-700";
    case "error":
      return "text-red-700";
    case "warning":
      return "text-yellow-700";
    case "info":
      return "text-blue-700";
  }
};

/**
 * Default auto-dismiss duration (milliseconds)
 */
export const DEFAULT_TOAST_DURATION = 5000;

/**
 * Toast container z-index
 */
export const TOAST_Z_INDEX = "z-50";

/**
 * Toast container position and spacing
 */
export const TOAST_CONTAINER_STYLES = "fixed top-4 right-4 z-50 space-y-3 max-w-md pointer-events-none";

/**
 * Toast item styles
 */
export const TOAST_ITEM_STYLES =
  "border rounded-lg shadow-lg p-4 flex items-start gap-3 animate-slideIn pointer-events-auto";
