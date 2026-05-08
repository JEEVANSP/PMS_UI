import { useCallback, useState } from "react";
import { useAppDispatch, useAppSelector } from "@app/store";

import { loginUser } from "@auth/slices";

import { useToast } from "@components/common/Toast/useToast";
import { extractAuthError } from "@auth/utils/extractAuthError";

export function useLoginFlow() {
  const dispatch = useAppDispatch();
  const { success } = useToast();

  // Read updated user from state after login
  const user = useAppSelector((s) => s.auth.user);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const clearError = useCallback(() => setErrorMessage(null), []);

  const login = useCallback(
    async (username: string, password: string) => {
      setErrorMessage(null);

      try {
        const res = await dispatch(loginUser({ username, password })).unwrap();

        if (!res?.accessToken) {
          setErrorMessage("Login failed: No access token returned.");
          return { ok: false as const, user: null };
        }

        success("Successfully logged in");

        // Return the current user from state (authSlice already decoded it)
        return { ok: true as const, user };
      } catch (err: unknown) {
        setErrorMessage(extractAuthError(err));
        return { ok: false as const, user: null };
      }
    },
    [dispatch, success, user]
  );

  return { login, errorMessage, clearError, user };
}
