/**
 * Checkbox component with label, description, and error support
 */

import React from "react";
import { cn } from "@shared/lib/cn";
import { mergeRefs } from "@shared/lib/mergeRefs";

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  description?: string;
  descriptionId?: string;
  indeterminate?: boolean;
};

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      error,
      description,
      descriptionId: descriptionIdProp,
      indeterminate = false,
      disabled = false,
      className,
      ...props
    },
    ref
  ) => {
    const checkboxRef = React.useRef<HTMLInputElement>(null);
    const checkboxId = React.useId();
    const descriptionId = descriptionIdProp || `${checkboxId}-description`;
    const errorId = `${checkboxId}-error`;

    // Merge refs: internal ref for indeterminate state + external ref
    const mergedRef = mergeRefs(checkboxRef, ref);

    // Set indeterminate visual state
    React.useEffect(() => {
      if (checkboxRef.current) {
        checkboxRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    // Build aria-describedby based on which elements are present
    const descriptionIds = [
      description ? descriptionId : null,
      error ? errorId : null,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={cn("flex flex-col gap-1", className)}>
        {/* Checkbox & Label */}
        <label
          className={cn(
            "flex items-center gap-2 cursor-pointer",
            disabled && "cursor-not-allowed opacity-60"
          )}
        >
          <input
            ref={mergedRef}
            id={checkboxId}
            type="checkbox"
            disabled={disabled}
            className={cn(
              "w-4 h-4 border rounded",
              error ? "border-red-500" : "border-gray-400",
              "focus:ring-blue-500 cursor-pointer",
              "accent-blue-600"
            )}
            aria-invalid={!!error}
            aria-describedby={descriptionIds || undefined}
            {...props}
          />

          {label && (
            <span className="text-gray-800 select-none text-sm">{label}</span>
          )}
        </label>

        {/* Description text */}
        {description && (
          <p id={descriptionId} className="text-gray-500 text-sm ml-6">
            {description}
          </p>
        )}

        {/* Error message */}
        {error && (
          <p id={errorId} role="alert" className="text-red-500 text-sm ml-6">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
