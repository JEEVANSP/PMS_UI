/**
 * Error Boundary component
 * Catches React component errors and displays fallback UI with recovery options
 */

import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { logger } from "@core/logger/logger";

/**
 * Error metadata captured when error occurs
 */
export interface ErrorMetadata {
  route?: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  userAgent: string;
}

interface Props {
  children: ReactNode;
  /**
   * Custom fallback component to render on error
   * Receives error, errorMetadata, and reset function as props
   */
  fallbackRender?: (error: Error, metadata: ErrorMetadata, reset: () => void) => ReactNode;
  /**
   * Optional fallback UI (if fallbackRender not provided)
   */
  fallback?: ReactNode;
  /**
   * Called when error is caught
   */
  onError?: (error: Error, metadata: ErrorMetadata) => void;
  /**
   * Called when reset button is clicked
   */
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorMetadata: ErrorMetadata | null;
}

export class ErrorBoundary extends Component<Props, State> {
  static displayName = "ErrorBoundary";

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorMetadata: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const metadata: ErrorMetadata = {
      route: window.location.pathname,
      stack: error.stack,
      componentStack: errorInfo.componentStack ?? undefined,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };

    this.setState({ errorMetadata: metadata });

    // Log the error with full context
    logger.error("ErrorBoundary caught an error", {
      error: error.message,
      ...metadata,
    });

    // Call optional error handler
    this.props.onError?.(error, metadata);
  }

  /**
   * Reset error boundary state
   */
  private handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorMetadata: null,
    });

    this.props.onReset?.();
  };

  render(): ReactNode {
    const { hasError, error, errorMetadata } = this.state;
    const { children, fallbackRender, fallback } = this.props;

    if (hasError && error && errorMetadata) {
      // Custom fallback render
      if (fallbackRender) {
        return fallbackRender(error, errorMetadata, this.handleReset);
      }

      // Custom fallback UI
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <div className="flex items-center justify-center min-h-screen bg-red-50 p-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="text-5xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-red-900 mb-2">Something went wrong</h1>
              <p className="text-red-700 text-sm mb-6">{error.message}</p>

              {/* Error details for debugging */}
              <details className="text-left mb-6 bg-red-50 p-3 rounded text-xs text-red-800">
                <summary className="cursor-pointer font-semibold mb-2">Error details</summary>
                <div className="space-y-2 font-mono text-xs overflow-auto max-h-40">
                  <p>
                    <strong>Route:</strong> {errorMetadata.route}
                  </p>
                  <p>
                    <strong>Time:</strong> {errorMetadata.timestamp}
                  </p>
                  {errorMetadata.stack && (
                    <p>
                      <strong>Stack:</strong> {errorMetadata.stack}
                    </p>
                  )}
                </div>
              </details>

              {/* Action buttons */}
              <div className="space-y-2">
                <button
                  onClick={this.handleReset}
                  className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try again
                </button>
                <button
                  onClick={() => window.location.href = "/"}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Go home
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

