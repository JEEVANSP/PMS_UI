export type UserRole = "manager" | "pharmacist" | "technician";

export interface User {
  id: string;
  username: string;
  role: UserRole;
  avatarUrl?: string;
}

export type AuthStatus = "idle" | "loading" | "succeeded" | "failed";

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  status: AuthStatus;
  error?: string;
}
