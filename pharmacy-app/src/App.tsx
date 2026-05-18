import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./app/routes/AppRoutes";
import { ToastProvider } from "@shared/ui/toast";
import { ErrorBoundary } from "@shared/errors";
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

