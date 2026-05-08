import { describe, it, expect, afterEach, vi } from "vitest";
import { configureStore, type AnyAction } from "@reduxjs/toolkit";
import { NETWORK_ERROR_MESSAGE } from "@core/errors/httpError";
import type { UserRole } from "@auth/types";

// ---- Mocks (declare first, then import SUT) ----
const loginApiMock = vi.fn();
const refreshApiMock = vi.fn();
const logoutApiMock = vi.fn();
vi.mock("@auth/api", () => ({
  loginApi: (...args: unknown[]) => loginApiMock(...args),
  refreshApi: (...args: unknown[]) => refreshApiMock(...args),
  logoutApi: (...args: unknown[]) => logoutApiMock(...args),
}));

const jwtDecodeMock = vi.fn();
vi.mock("jwt-decode", () => ({
  jwtDecode: (...args: unknown[]) => jwtDecodeMock(...args),
}));

// ---- Import SUT after mocks ----
import authReducer, {
  loginUser,
  refreshAccess,
  serverLogout,
  logout,
} from "@auth/slices";

// ---- Helpers ----
function makeStore() {
  return configureStore({
    reducer: { auth: authReducer },
  });
}

describe("authSlice - end-to-end + reducer coverage", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("should initialize with user=null, accessToken=null, status='idle'", () => {
      const store = makeStore();
      const state = store.getState().auth;
      expect(state).toEqual({
        user: null,
        accessToken: null,
        status: "idle",
      });
    });
  });

  describe("loginUser thunk", () => {
    it("sets status=loading and clears error on pending (reducer path)", () => {
      // Directly reduce the pending action to ensure that path is covered
      const prev: ReturnType<typeof authReducer> = {
        user: null,
        accessToken: null,
        status: "idle",
        error: "Old error",
      };
      const next = authReducer(prev, { type: loginUser.pending.type } as AnyAction);
      expect(next.status).toBe("loading");
      expect(next.error).toBeUndefined();
    });

    it("fulfilled → stores accessToken, decodes user, status=succeeded", async () => {
      const store = makeStore();

      const token = "token-1";
      const payload: {
        sub: string;
        username: string;
        role: UserRole;
        exp: number;
        avatarUrl?: string;
      } = {
        sub: "u-1",
        username: "alice",
        role: "manager",
        exp: 1234567890,
        avatarUrl: "https://example.com/a.png",
      };

      loginApiMock.mockResolvedValue({ accessToken: token });
      jwtDecodeMock.mockReturnValue(payload);

      const resultAction = await store.dispatch(
        loginUser({ username: "alice", password: "pw" })
      );

      // Assert thunk fulfilled
      expect(resultAction.type).toBe(loginUser.fulfilled.type);
      expect(loginApiMock).toHaveBeenCalledWith({ username: "alice", password: "pw" });
      expect(jwtDecodeMock).toHaveBeenCalledWith(token);

      // Assert state changes
      const state = store.getState().auth;
      expect(state.status).toBe("succeeded");
      expect(state.accessToken).toBe(token);
