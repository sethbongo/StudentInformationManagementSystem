import { apiClient } from "./api-client";
import { ApiResponse } from "../types/api";
import { User, AuthResponse, LoginCredentials } from "../types/auth";

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const res = await apiClient.post<ApiResponse<AuthResponse>>("/auth/login", credentials);
    return res.data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // Continue even if server logout endpoint fails
    } finally {
      localStorage.removeItem("sims_auth_token");
      localStorage.removeItem("sims_user_profile");
    }
  },

  async getMe(): Promise<User> {
    const res = await apiClient.get<ApiResponse<User>>("/auth/me");
    return res.data;
  },
};
