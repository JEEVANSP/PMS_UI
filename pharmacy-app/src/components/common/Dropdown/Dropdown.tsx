import type React from "react";
import Select, { type SelectOption } from "../Select/Select";

type DropdownProps = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "onChange" | "size"
> & {
  label?: React.ReactNode;
  options: Array<string | SelectOption>;
  error?: string;
  placeholder?: string;
  variant?: "default" | "error";
  size?: "sm" | "md" | "lg";
  selectClassName?: string;
  onChange?: (value: string) => void;
};

export default function Dropdown({
  onChange,
  selectClassName,
  className,
  ...props
}: DropdownProps) {
  return (
    <Select
      {...props}
      className={selectClassName ?? className}
      onChange={(event) => onChange?.(event.target.value)}
    />
  );
}

export type { DropdownProps, SelectOption as DropdownOption };
