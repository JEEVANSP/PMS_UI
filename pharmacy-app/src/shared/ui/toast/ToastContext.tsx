/**
 * Toast context for React
 * Export types and create the context
 */

import { createContext } from "react";
import type { ToastContextType } from "./toast.types";

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

ToastContext.displayName = "ToastContext";
