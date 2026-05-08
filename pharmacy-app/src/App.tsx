import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./app/routes/AppRoutes";
import { ToastProvider } from "@components/common/Toast/ToastProvider";
import { ErrorBoundary } from "@components/common/ErrorBoundary/ErrorBoundary";
import SessionTimeoutHandler from "@auth/session/SessionTimeoutHandler";

export default function App() {
  return (
    <ErrorBoundary fallback={<div>Something went wrong.</div>}>
      <ToastProvider>
        <BrowserRouter>
          <SessionTimeoutHandler />
          <AppRoutes />
        </BrowserRouter>
      </ToastProvider>
    </ErrorBoundary>
  );
}
