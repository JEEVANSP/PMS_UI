import React from "react";
import Input from "../Input/Input";
import type { InputSize, InputVariant } from "../Input/Input.types";

type TextAreaProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "size"
> & {
  label?: React.ReactNode;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: InputVariant;
  size?: InputSize;
  name?: string;
};

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ rows = 3, ...props }, ref) => (
    <Input
      ref={ref as React.Ref<HTMLInputElement | HTMLTextAreaElement>}
      as="textarea"
      rows={rows}
      {...props}
    />
  )
);

TextArea.displayName = "TextArea";

export default TextArea;
