import React from "react";
import { cn } from "@shared/lib/cn";
import FormField from "@shared/form/FormField";
import type { InputProps, InputVariant } from "./Input.types";
import {
  sizeClasses,
  variantClasses,
  baseInputStyles,
  textareaInputStyles,
  inputWrapperStyles,
  disabledStyles,
  iconStyles,
} from "./Input.styles";

const Input = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  InputProps
>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      variant = "default",
      size = "md",
      as = "input",
      id,
      className,
      disabled = false,
      required = false,
      name,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const hasError = !!error;
    const effectiveVariant: InputVariant = hasError ? "error" : variant;
    const isTextarea = as === "textarea";
    const describedBy = hasError
      ? `${inputId}-error`
      : hint
      ? `${inputId}-hint`
      : undefined;

    return (
      <FormField
        label={label}
        hint={hint}
        error={error}
        required={required}
        htmlFor={inputId}
      >
        <div
          className={cn(
            inputWrapperStyles,
            isTextarea && "items-start",
            sizeClasses[size],
            variantClasses[effectiveVariant],
            disabled && disabledStyles,
            className
          )}
        >
          {leftIcon && <span className={iconStyles}>{leftIcon}</span>}

          {isTextarea ? (
            <textarea
              ref={ref as React.Ref<HTMLTextAreaElement>}
              id={inputId}
              name={name}
              disabled={disabled}
              required={required}
              aria-invalid={hasError}
              aria-describedby={describedBy}
              className={cn(baseInputStyles, textareaInputStyles)}
              {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            />
          ) : (
            <input
              ref={ref as React.Ref<HTMLInputElement>}
              id={inputId}
              name={name}
              disabled={disabled}
              required={required}
              aria-invalid={hasError}
              aria-describedby={describedBy}
              className={baseInputStyles}
              {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
            />
          )}

          {rightIcon && !isTextarea && <span className={iconStyles}>{rightIcon}</span>}
        </div>
      </FormField>
    );
  }
);

Input.displayName = "Input";

export default Input;
