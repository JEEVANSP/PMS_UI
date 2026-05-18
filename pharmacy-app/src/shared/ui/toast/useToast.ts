/**
 * Toast hook for accessing toast context
 */

import { useContext } from "react";
import { ToastContext } from "./ToastContext";
import type { ToastContextType } from "./toast.types";

/**
 * Hook to access toast functions
 * Must be used inside ToastProvider
 *
 * @throws Error if used outside ToastProvider
 * @returns Toast context with all toast methods
 *
 * @example
 * function MyComponent() {
 *   const { success, error } = useToast();
 *
 *   const handleClick = () => {
 *     success("Done!", "Operation completed successfully");
 *   };
 *
 *   return <button onClick={handleClick}>Show Toast</button>;
 * }
 */
export function useToast(): ToastContextType {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside <ToastProvider>");
  }

  return context;
}
