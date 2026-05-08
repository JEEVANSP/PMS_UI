import axios, { AxiosHeaders } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { store } from "@app/store";
import { logout, refreshAccess } from "@auth/slices";
import { toast } from "@components/common/Toast/toastService";
import { logger } from "@core/logger/logger";
import { ENV } from "@core/config/env";

type RetriableConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const api = axios.create({
  baseURL: ENV.API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const url = config.url ?? "";
  const skipAuth = url.includes("/auth/login") || url.includes("/auth/refresh");

  if (!skipAuth) {
    const token = store.getState().auth.accessToken;
    if (token) {
      const headers = new AxiosHeaders(config.headers);
      headers.set("Authorization", `Bearer ${token}`);
      config.headers = headers;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest: RetriableConfig = error.config || {};
    const status = error.response?.status;
    const url = originalRequest?.url ?? "";
    const isAuthCall = url.includes("/auth/login") || url.includes("/auth/refresh");

    if (status === 401 && !originalRequest._retry && !isAuthCall) {
      originalRequest._retry = true;

      const refreshResult = await store.dispatch(refreshAccess());

      if (refreshAccess.fulfilled.match(refreshResult)) {
        const newToken = refreshResult.payload.accessToken;

        api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

        const headers = new AxiosHeaders(originalRequest.headers);
        headers.set("Authorization", `Bearer ${newToken}`);
        originalRequest.headers = headers;

        return api(originalRequest);
      }

      store.dispatch(logout());
      throw error;
    }

    if (status === 403) {
      logger.error("Forbidden: insufficient permissions");
    }

    if (status === 500) {
      logger.error("Server error occurred");
    }

    if (status === 412) {
      toast.error("Conflict", "Prescription was modified by another user.");
    }

    throw error;
  },
);

export default api;
