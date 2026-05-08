import { jwtDecode } from "jwt-decode";
import type { User, UserRole } from "@auth/types";

type TokenPayload = {
  sub: string;
  username: string;
  role: UserRole;
  exp: number;
  avatarUrl?: string;
};

export function decodeAccessToken(token: string): User {
  const payload = jwtDecode<TokenPayload>(token);
  return {
    id: payload.sub,
    username: payload.username,
    role: payload.role,
    avatarUrl: payload.avatarUrl,
  };
}
