import { apiClient } from "./api-client";
import { ApiResponse, PaginatedResponse } from "../types/api";
import { Course } from "../types/entities";

export const courseService = {
  async listCourses(params?: { search?: string; program_id?: string; page?: number; per_page?: number }): Promise<PaginatedResponse<Course>> {
    return apiClient.get<PaginatedResponse<Course>>("/courses", params);
  },

  async getCourseById(id: string): Promise<Course> {
    const res = await apiClient.get<ApiResponse<Course>>(`/courses/${id}`);
    return res.data;
  },

  async createCourse(payload: {
    code: string;
    title: string;
    description?: string;
    units: number;
    lectureHours?: number;
    labHours?: number;
    programId?: string;
    prerequisiteIds?: string[];
  }): Promise<Course> {
    const res = await apiClient.post<ApiResponse<Course>>("/courses", payload);
    return res.data;
  },

  async updateCourse(id: string, payload: Partial<Course>): Promise<Course> {
    const res = await apiClient.patch<ApiResponse<Course>>(`/courses/${id}`, payload);
    return res.data;
  },

  async deleteCourse(id: string): Promise<void> {
    await apiClient.delete(`/courses/${id}`);
  },

  async getPrerequisites(id: string): Promise<any[]> {
    const res = await apiClient.get<ApiResponse<any[]>>(`/courses/${id}/prerequisites`);
    return res.data;
  },
};
