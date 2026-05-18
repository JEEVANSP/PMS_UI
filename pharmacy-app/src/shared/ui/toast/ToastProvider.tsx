/**
 * Toast Provider Component
 * Manages toast state and renders toast notifications
 */

import { useState, useCallback, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { nanoid } from "nanoid";
import { logger } from "@core/logger/logger";
import { ToastContext } from "./ToastContext";
import { ToastItem } from "./ToastItem";
import { registerToastApi, unregisterToastApi } from "./toastService";
import { DEFAULT_TOAST_DURATION, TOAST_CONTAINER_STYLES } from "./toast.config";
import type { Toast, ToastType, ToastContextType } from "./toast.types";
import "@styles/animations/toast.css";

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Use ref to track timer IDs for cleanup - prevents memory leaks
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  /**
   * Show a toast notification
   */
  const showToast = useCallback(
    (type: ToastType, title: string, message?: string, duration: number = DEFAULT_TOAST_DURATION) => {
      try {
        const id = nanoid();
        const toast: Toast = { id, type, title, message, duration };

        setToasts((prev) => [...prev, toast]);

        // Auto-remove toast after duration
        if (duration > 0) {
          const timeoutId = setTimeout(() => {
            removeToast(id);
          }, duration);

          timersRef.current.set(id, timeoutId);
        }
      } catch (error) {
        logger.error("Failed to show toast", error);
      }
    },
    []
  );

  /**
   * Remove a specific toast
   */
  const removeToast = useCallback((id: string) => {
    // Clear timeout if it exists
    const timeout = timersRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timersRef.current.delete(id);
    }

    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /**
   * Convenience methods
   */
  const success = useCallback(
    (title: string, message?: string, duration?: number) => {
      showToast("success", title, message, duration);
    },
    [showToast]
  );

  const error = useCallback(
    (title: string, message?: string, duration?: number) => {
      showToast("error", title, message, duration);
    },
    [showToast]
  );

  const warning = useCallback(
    (title: string, message?: string, duration?: number) => {
      showToast("warning", title, message, duration);
    },
    [showToast]
  );

  const info = useCallback(
    (title: string, message?: string, duration?: number) => {
      showToast("info", title, message, duration);
    },
    [showToast]
  );

  const value: ToastContextType = {
    showToast,
    success,
    error,
    warning,
    info,
    removeToast,
  };

  /**
   * Register API for global access
   */
  useEffect(() => {
    registerToastApi({ success, error, warning, info });
    return () => {
      unregisterToastApi();
      // Cleanup all timers on unmount
      timersRef.current.forEach((timeout) => clearTimeout(timeout));
      timersRef.current.clear();
    };
  }, [success, error, warning, info]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Toast Container */}
      <div className={TOAST_CONTAINER_STYLES} data-testid="toast-container">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

ToastProvider.displayName = "ToastProvider";
