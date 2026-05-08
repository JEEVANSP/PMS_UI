import { useCallback, useMemo, useState } from "react";
import { useAppDispatch } from "@app/store";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import { loginUser } from "@auth/slices";

import { useToast } from "@components/common/Toast/useToast";
import { getDashboardRoute } from "@auth/utils/getDashboardRoute";
import { extractAuthError } from "@auth/types";
import type { UserRole } from "@auth/types";

type TokenPayload = {
  role: UserRole;
};

type LoginFlowDeps = {
  /** For testability: allow injecting a decoder */
  decodeToken?: (token: string) => TokenPayload;
  /** For testability: allow injecting route mapping */
  getRoute?: (role: UserRole) => string;
};

export function useLoginFlow(deps?: LoginFlowDeps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { success } = useToast();

  const decode = useMemo(
    () => deps?.decodeToken ?? ((t: string) => jwtDecode<TokenPayload>(t)),
    [deps?.decodeToken]
  );

  const routeFor = useMemo(
    () => deps?.getRoute ?? getDashboardRoute,
    [deps?.getRoute]
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const clearError = useCallback(() => setErrorMessage(null), []);

  const login = useCallback(
    async (username: string, password: string) => {
      setErrorMessage(null);

      try {
        const res = await dispatch(loginUser({ username, password })).unwrap();

        if (!res?.accessToken) {
          setErrorMessage("Login failed: No access token returned.");
          return { ok: false as const };
        }

        const payload = decode(res.accessToken);

        if (!payload?.role) {
          setErrorMessage("Login failed: Invalid token payload.");
          return { ok: false as const };
        }
        success("Successfully logged in");

        navigate(routeFor(payload.role));
        return { ok: true as const };
      } catch (err: unknown) {
        setErrorMessage(extractAuthError(err));
        return { ok: false as const };
      }
    },
    [decode, dispatch, navigate, routeFor, success]
  );

  return { login, errorMessage, clearError };
}
