import { apiClient } from "./api-client";
import { ApiResponse } from "../types/api";
import { User, AuthResponse, LoginCredentials } from "../types/auth";

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const res = await apiClient.post<ApiResponse<any>>("/auth/login", credentials);
    const data = res.data;
    const token = data.accessToken || data.token || "";
    return {
      user: {
        ...data.user,
        studentId: data.user.studentId ?? data.user.studentProfile?.id ?? null,
        instructorId: data.user.instructorId ?? data.user.instructorProfile?.id ?? null,
      },
      token,
      accessToken: token,
    };
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
    const res = await apiClient.get<ApiResponse<any>>("/auth/me");
    const user = res.data;
    return {
      ...user,
      studentId: user.studentId ?? user.studentProfile?.id ?? null,
      instructorId: user.instructorId ?? user.instructorProfile?.id ?? null,
    };
  },
};
