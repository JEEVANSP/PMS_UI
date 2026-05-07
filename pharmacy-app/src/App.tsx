import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { ToastProvider } from "@components/common/Toast/ToastProvider";
import { ErrorBoundary } from "@components/common/ErrorBoundary/ErrorBoundary";
import SessionTimeoutHandler from "@auth/session/SessionTimeoutHandler";

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <SessionTimeoutHandler />
        <ErrorBoundary fallback={<div>Something went wrong.</div>}>
          <AppRoutes />
        </ErrorBoundary>
      </BrowserRouter>
    </ToastProvider>
  );
}
