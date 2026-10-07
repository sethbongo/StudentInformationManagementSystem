import { apiClient } from "./api-client";
import { ApiResponse, PaginatedResponse } from "../types/api";
import { Program } from "../types/entities";

export const programService = {
  async listPrograms(params?: { search?: string; status?: string; page?: number; per_page?: number }): Promise<PaginatedResponse<Program>> {
    return apiClient.get<PaginatedResponse<Program>>("/programs", params);
  },

  async getProgramById(id: string): Promise<Program> {
    const res = await apiClient.get<ApiResponse<Program>>(`/programs/${id}`);
    return res.data;
  },

  async createProgram(payload: { code: string; name: string; description?: string; totalUnitsRequired?: number }): Promise<Program> {
    const res = await apiClient.post<ApiResponse<Program>>("/programs", payload);
    return res.data;
  },

  async updateProgram(id: string, payload: Partial<Program>): Promise<Program> {
    const res = await apiClient.patch<ApiResponse<Program>>(`/programs/${id}`, payload);
    return res.data;
  },

  async deleteProgram(id: string): Promise<void> {
    await apiClient.delete(`/programs/${id}`);
  },
};
