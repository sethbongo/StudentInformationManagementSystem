import { apiClient } from "./api-client";
import { ApiResponse, PaginatedResponse } from "../types/api";
import { Enrollment } from "../types/entities";

export const enrollmentService = {
  async listEnrollments(params?: {
    student_id?: string;
    course_offering_id?: string;
    status?: string;
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<Enrollment>> {
    return apiClient.get<PaginatedResponse<Enrollment>>("/enrollments", params);
  },

  async getEnrollmentById(id: string): Promise<Enrollment> {
    const res = await apiClient.get<ApiResponse<Enrollment>>(`/enrollments/${id}`);
    return res.data;
  },

  async enrollStudent(payload: {
    studentId?: string;
    courseOfferingId: string;
  }): Promise<Enrollment> {
    const res = await apiClient.post<ApiResponse<Enrollment>>("/enrollments", payload);
    return res.data;
  },

  async updateStatus(id: string, status: string): Promise<Enrollment> {
    const res = await apiClient.patch<ApiResponse<Enrollment>>(`/enrollments/${id}`, { status });
    return res.data;
  },

  async dropEnrollment(id: string): Promise<void> {
    await apiClient.delete(`/enrollments/${id}`);
  },
};
