import api from "@core/api/apiClient";
import { ENDPOINTS } from "@core/api/endpoints";
import type {
  AuthTokenResponseDto,
  LoginCredentialsDto,
  LogoutResponseDto,
} from "./auth.dto";

export async function loginApi(credentials: LoginCredentialsDto) {
  try {
    const res = await api.post(ENDPOINTS.login, credentials);
    return res.data as AuthTokenResponseDto;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
}

export async function refreshApi() {
  try {
    console.log("refreshed");
    const res = await api.post(ENDPOINTS.refresh);
    return res.data as AuthTokenResponseDto;
  } catch (error) {
    console.error("Token refresh failed:", error);
    throw error;
  }
}

export async function logoutApi() {
  try {
    await api.post(ENDPOINTS.logout);
    return {} as LogoutResponseDto;
  } catch (error) {
    console.error("Logout failed:", error);
    throw error;
  }
}
