import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { loginApi, refreshApi, logoutApi } from "@auth/api";
import { extractApiError } from "@core/errors/httpError";
import { extractAuthError } from "@auth/utils/extractAuthError";
import { decodeAccessToken } from "@auth/utils/decodeAccessToken";
import type { AuthState } from "@auth/types";
import type { LoginCredentialsDto, AuthTokenResponseDto } from "@auth/api";

const initialState: AuthState = { user: null, accessToken: null, status: "idle" };

const getErrorMessage = (error: unknown): string => {
  if (typeof error === "string") return error;
  if (typeof error === "object" && error !== null) {
    const err = error as { message?: string };
    return err.message || "Unknown error";
  }
  return "Unknown error";
};

// Thunks with explicit types
export const loginUser = createAsyncThunk<
  AuthTokenResponseDto,
  LoginCredentialsDto,
  { rejectValue: string }
>(
  "auth/login",
  async (credentials: LoginCredentialsDto, { rejectWithValue }) => {
    try {
      const res = await loginApi(credentials);
      return res;
    } catch (error) {
      return rejectWithValue(extractAuthError(error));
    }
  }
);

export const refreshAccess = createAsyncThunk<
  AuthTokenResponseDto,
  void,
  { rejectValue: string }
>(
  "auth/refresh",
  async (_, { rejectWithValue }) => {
    try {
      const res = await refreshApi();
      return res; // { accessToken }
    } catch (error) {
      return rejectWithValue(
        extractApiError(error) || getErrorMessage(error) || "Refresh failed"
      );
    }
  }
);

export const serverLogout = createAsyncThunk<void, void, { rejectValue: string }>(
  "auth/logout",
  async () => {
    await logoutApi();
  }
);

// Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.status = "idle";
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.accessToken = action.payload.accessToken;
        state.user = decodeAccessToken(action.payload.accessToken);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
        state.accessToken = null;
        state.user = null;
      })

      // REFRESH
      .addCase(refreshAccess.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.user = decodeAccessToken(action.payload.accessToken);
      })
      .addCase(refreshAccess.rejected, (state) => {
        // Clear state on refresh failure to force logout
        state.accessToken = null;
        state.user = null;
        state.status = "idle";
      })

      // LOGOUT
      .addCase(serverLogout.fulfilled, (state) => {
        state.accessToken = null;
        state.user = null;
        state.status = "idle";
        state.error = undefined;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
