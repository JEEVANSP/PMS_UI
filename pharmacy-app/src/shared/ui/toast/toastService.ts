/**
 * Toast service for global toast access
 * Register the toast API during app initialization, then use anywhere
 */

import { logger } from "@core/logger/logger";
import type { ToastApi, ToastFn } from "./toast.types";

let toastApi: ToastApi | null = null;

/**
 * Register the toast API (called by ToastProvider)
 */
export function registerToastApi(api: ToastApi): void {
  if (toastApi) {
    logger.warn("ToastApi already registered");
  }
  toastApi = api;
}

/**
 * Unregister the toast API
 */
export function unregisterToastApi(): void {
  toastApi = null;
}

/**
 * Safely invoke a toast function with fallback logging
 */
function safeInvoke(
  fn: ToastFn | undefined,
  fallbackPrefix: string,
  title: string,
  message?: string,
  duration?: number
): void {
  if (fn) {
    fn(title, message, duration);
    return;
  }
  // If toast context not available, log the error
  const fullMessage = message ? `${title} - ${message}` : title;
  logger.error(`${fallbackPrefix}: ${fullMessage}`, { duration });
}

/**
 * Global toast API
 * Use this anywhere after ToastProvider is initialized
 *
 * @example
 * import { toast } from '@shared/ui/toast/toastService';
 *
 * toast.success("Success!", "Operation completed");
 */
export const toast = {
  success: (title: string, message?: string, duration?: number): void =>
    safeInvoke(toastApi?.success, "toast:success", title, message, duration),

  error: (title: string, message?: string, duration?: number): void =>
    safeInvoke(toastApi?.error, "toast:error", title, message, duration),

  warning: (title: string, message?: string, duration?: number): void =>
    safeInvoke(toastApi?.warning, "toast:warning", title, message, duration),

  info: (title: string, message?: string, duration?: number): void =>
    safeInvoke(toastApi?.info, "toast:info", title, message, duration),
};
