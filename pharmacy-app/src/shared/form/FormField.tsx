import React from "react";

export type FormFieldProps = React.HTMLAttributes<HTMLDivElement> & {
  label?: React.ReactNode;
  hint?: string;
  error?: string;
  required?: boolean;
  htmlFor?: string;
  children: React.ReactNode;
};

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, error, hint, required, htmlFor, children, ...props }, ref) => {
    return (
      <div ref={ref} className="flex flex-col gap-1" {...props}>
        {label && (
          <label
            htmlFor={htmlFor}
            className="text-sm font-medium text-gray-900 block"
          >
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}

        {children}

        {error ? (
          <p
            role="alert"
            className="text-xs text-red-500 mt-1"
            id={`${htmlFor}-error`}
          >
            {error}
          </p>
        ) : hint ? (
          <p className="text-xs text-gray-500 mt-1" id={`${htmlFor}-hint`}>
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);

FormField.displayName = "FormField";

export { FormField };
export default FormField;
