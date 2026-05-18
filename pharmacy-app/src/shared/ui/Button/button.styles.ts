import { cn } from "@shared/lib/cn";

export const buttonVariants = {
  base: "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none",
  variants: {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500",
    secondary:
      "bg-gray-300 text-gray-800 hover:bg-gray-400 focus-visible:ring-gray-400",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
    ghost:
      "bg-transparent text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-300",
    outline:
      "border border-gray-300 text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-300",
  },
  sizes: {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  },
};

export type ButtonVariant = keyof typeof buttonVariants.variants;
export type ButtonSize = keyof typeof buttonVariants.sizes;

export function getButtonClassName(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
  disabled?: boolean,
  loading?: boolean
) {
  return cn(
    buttonVariants.base,
    buttonVariants.variants[variant],
    buttonVariants.sizes[size],
    disabled && "opacity-50 cursor-not-allowed",
    loading && "opacity-75 cursor-wait",
    className
  );
}
