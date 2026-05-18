import React from "react";
import { cn } from "@shared/lib/cn";

export interface SelectOption {
  label: string;
  value: string;
}

type SelectProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> & {
  label?: React.ReactNode;
  options: Array<string | SelectOption>;
  error?: string;
  placeholder?: string;
  variant?: "default" | "error";
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-4 py-3 text-lg",
};

const variantClasses = {
  default:
    "border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-500",
  error:
    "border border-red-500 bg-red-50 focus:ring-2 focus:ring-red-500",
};

function normalizeOption(option: string | SelectOption): SelectOption {
  if (typeof option === "string") {
    return { label: option, value: option };
  }
  return option;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      error,
      placeholder,
      variant = "default",
      size = "md",
      disabled = false,
      required = false,
      className,
      ...props
    },
    ref
  ) => {
    const selectId = React.useId();
    const hasError = !!error;
    const normalizedOptions = options.map(normalizeOption);

    return (
      <div className="flex flex-col gap-1">
        {/* Label */}
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-gray-700 block"
          >
            {label}
            {required && <span className="text-red-500"> *</span>}
          </label>
        )}

        {/* Select */}
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          required={required}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${selectId}-error` : undefined}
          className={cn(
            "w-full rounded-xl transition focus:outline-none",
            sizeClasses[size],
            variantClasses[hasError ? "error" : variant],
            disabled && "cursor-not-allowed opacity-60 bg-gray-100",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {normalizedOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Error Message */}
        {error && (
          <p id={`${selectId}-error`} className="text-xs text-red-500 mt-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
