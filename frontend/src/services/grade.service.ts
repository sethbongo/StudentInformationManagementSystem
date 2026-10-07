import { apiClient } from "./api-client";
import { ApiResponse, PaginatedResponse } from "../types/api";
import { Grade } from "../types/entities";

export const gradeService = {
  async listGrades(params?: {
    offering_id?: string;
    course_id?: string;
    student_id?: string;
    search?: string;
    remarks?: string;
    is_finalized?: boolean;
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<Grade>> {
    return apiClient.get<PaginatedResponse<Grade>>("/grades", params);
  },

  async getGradeById(id: string): Promise<Grade> {
    const res = await apiClient.get<ApiResponse<Grade>>(`/grades/${id}`);
    return res.data;
  },

  async submitGrade(payload: {
    enrollmentId: string;
    numericGrade?: number;
    midtermGrade?: number;
    finalGrade?: number;
    letterGrade?: string;
    remarks?: string;
    isFinalized?: boolean;
  }): Promise<Grade> {
    const res = await apiClient.post<ApiResponse<Grade>>("/grades", payload);
    return res.data;
  },

  async updateGrade(
    id: string,
    payload: {
      numericGrade?: number;
      midtermGrade?: number;
      finalGrade?: number;
      letterGrade?: string;
      remarks?: string;
      isFinalized?: boolean;
    }
  ): Promise<Grade> {
    const res = await apiClient.patch<ApiResponse<Grade>>(`/grades/${id}`, payload);
    return res.data;
  },
};
