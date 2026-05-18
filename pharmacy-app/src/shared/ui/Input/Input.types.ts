import type React from "react";

export type InputSize = "sm" | "md" | "lg";
export type InputVariant = "default" | "error";
export type InputElement = "input" | "textarea";

type SharedInputProps = {
  label?: React.ReactNode;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: InputVariant;
  size?: InputSize;
  name?: string;
};

type NativeInputProps = SharedInputProps &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> & {
    as?: Extract<InputElement, "input">;
  };

type NativeTextareaProps = SharedInputProps &
  Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> & {
    as: Extract<InputElement, "textarea">;
  };

export type InputProps = NativeInputProps | NativeTextareaProps;
