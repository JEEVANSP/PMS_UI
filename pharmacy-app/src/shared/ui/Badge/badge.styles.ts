export type BadgeVariant =
  | "default"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "outline";

export const badgeVariants: Record<BadgeVariant, string> = {
  default: "bg-blue-600 text-white",
  secondary: "bg-gray-200 text-gray-800",
  success: "bg-green-100 text-green-700",
  warning: "bg-yellow-100 text-yellow-700",
  error: "bg-red-100 text-red-700",
  outline: "border border-gray-300 text-gray-700 bg-transparent",
};

export const badgeBase =
  "inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap";
