import React, { useState } from "react";
import "react-phone-number-input/style.css";
import "./phoneInput.styles.css";
import PhoneInput, { type Country, type Value } from "react-phone-number-input";
import { cn } from "@shared/lib/cn";

type PhoneInputProps = Omit<React.InputHTMLAttributes<HTMLDivElement>, "onChange"> & {
  label?: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  warning?: string;
  defaultCountry?: Country;
};

const PhoneInputField = React.forwardRef<HTMLDivElement, PhoneInputProps>(
  (
    {
      label,
      value,
      onChange,
      error,
      warning,
      defaultCountry = "IN",
      disabled = false,
      className,
      ...props
    },
    ref
  ) => {
    const [country, setCountry] = useState<Country>(defaultCountry);

    return (
      <div ref={ref} className={cn("flex flex-col gap-1", className)} {...props}>
        {/* Label */}
        {label && (
          <label className="text-sm font-medium text-gray-900 mb-1 block">
            {label}
          </label>
        )}

        {/* Wrapper */}
        <div
          className={cn(
            "flex items-center gap-3 h-11 px-4 rounded-lg transition-all duration-200 shadow-inner",
            disabled
              ? "bg-gray-100 cursor-not-allowed opacity-70"
              : "bg-gray-50 border border-gray-200 hover:bg-gray-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500",
            error && "ring-1 ring-red-500 bg-red-50",
            "phone-input-shell"
          )}
        >
          <PhoneInput
            className="phone-input w-full"
            international={false}
            country={country}
            onCountryChange={(c) =>
              setCountry((c || defaultCountry) as Country)
            }
            value={(value || "") as Value}
            onChange={(v) => onChange((v || "").toString())}
            disabled={disabled}
          />
        </div>

        {/* Error / Warning */}
        {error ? (
          <p className="text-xs text-red-500 mt-1">{error}</p>
        ) : warning ? (
          <p className="text-xs text-yellow-600 mt-1">{warning}</p>
        ) : null}
      </div>
    );
  }
);

PhoneInputField.displayName = "PhoneInput";

export default PhoneInputField;
