/**
 * Input component styles
 * Centralized style classes for consistency
 */

import type { InputSize, InputVariant } from "./Input.types";

export const sizeClasses: Record<InputSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-4 py-3 text-lg",
};

export const variantClasses: Record<InputVariant, string> = {
  default:
    "border border-gray-200 bg-gray-50 hover:bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500",
  error: "border border-red-500 bg-red-50 focus:ring-2 focus:ring-red-500",
};

export const baseInputStyles =
  "w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-500 outline-none";

export const textareaInputStyles = "min-h-24 resize-y";

export const inputWrapperStyles =
  "flex items-center gap-3 rounded-lg transition-all duration-200 shadow-inner";

export const disabledStyles = "opacity-70 cursor-not-allowed bg-gray-100";

export const iconStyles = "text-gray-400 flex-shrink-0";
