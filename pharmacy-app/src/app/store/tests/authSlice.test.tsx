import { configureStore } from "@reduxjs/toolkit";
import { describe, expect, it, vi } from "vitest";
import type { UserRole } from "@auth/types";

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

import authReducer, { loginUser, logout, refreshAccess } from "@auth/slices";

function makeStore() {
  return configureStore({
    reducer: { auth: authReducer },
  });
}

describe("authSlice", () => {
  it("initializes auth state", () => {
    const store = makeStore();

    expect(store.getState().auth).toEqual({
      user: null,
      accessToken: null,
      status: "idle",
    });
  });

  it("stores token and decoded user after login", async () => {
    const token = "token-1";
    const payload: {
      sub: string;
      username: string;
      role: UserRole;
      exp: number;
    } = {
      sub: "u-1",
      username: "alice",
      role: "manager",
      exp: 1234567890,
    };

    loginApiMock.mockResolvedValue({ accessToken: token });
    jwtDecodeMock.mockReturnValue(payload);

    const store = makeStore();
    const action = await store.dispatch(loginUser({ username: "alice", password: "pw" }));

    expect(action.type).toBe(loginUser.fulfilled.type);
    expect(store.getState().auth).toEqual({
      user: { id: "u-1", username: "alice", role: "manager", avatarUrl: undefined },
      accessToken: token,
      status: "succeeded",
    });
  });

  it("clears auth state on refresh failure and logout", async () => {
    refreshApiMock.mockRejectedValue(new Error("expired"));

    const store = makeStore();
    await store.dispatch(refreshAccess());
    store.dispatch(logout());

    expect(store.getState().auth).toEqual({
      user: null,
      accessToken: null,
      status: "idle",
    });
  });
});
