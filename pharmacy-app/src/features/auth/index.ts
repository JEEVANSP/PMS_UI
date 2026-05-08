// Auth module exports - use explicit imports where possible
export { default as LoginPage } from "./components/LoginPage";
export { default as SessionTimeoutHandler } from "./session/SessionTimeoutHandler";
export { useSessionTimeout } from "./session/useSessionTimeout";
export { useLoginFlow } from "./hooks/useLoginFlow";
export { getDashboardRoute } from "./utils/getDashboardRoute";

// Type exports
export type { User, UserRole, AuthStatus, AuthState } from "./types";
export { AUTH_INVALID_CREDENTIALS_MESSAGE } from "./types";

// Action exports
export { loginUser, refreshAccess, serverLogout, logout } from "./slices/authSlice";
