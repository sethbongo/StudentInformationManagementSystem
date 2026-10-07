import { apiClient } from "./api-client";
import { ApiResponse, PaginatedResponse } from "../types/api";
import { AcademicTerm } from "../types/entities";

export const termService = {
  async listTerms(params?: { isCurrent?: boolean; status?: string; page?: number; per_page?: number }): Promise<PaginatedResponse<AcademicTerm>> {
    return apiClient.get<PaginatedResponse<AcademicTerm>>("/academic-terms", params);
  },

  async getTermById(id: string): Promise<AcademicTerm> {
    const res = await apiClient.get<ApiResponse<AcademicTerm>>(`/academic-terms/${id}`);
    return res.data;
  },

  async createTerm(payload: {
    code: string;
    name: string;
    academicYear: string;
    semester: string;
    startDate: string;
    endDate: string;
    isCurrent?: boolean;
  }): Promise<AcademicTerm> {
    const res = await apiClient.post<ApiResponse<AcademicTerm>>("/academic-terms", payload);
    return res.data;
  },

  async updateTerm(id: string, payload: Partial<AcademicTerm>): Promise<AcademicTerm> {
    const res = await apiClient.patch<ApiResponse<AcademicTerm>>(`/academic-terms/${id}`, payload);
    return res.data;
  },

  async deleteTerm(id: string): Promise<void> {
    await apiClient.delete(`/academic-terms/${id}`);
  },
};
