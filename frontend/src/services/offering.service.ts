import { apiClient } from "./api-client";
import { ApiResponse, PaginatedResponse } from "../types/api";
import { CourseOffering } from "../types/entities";

export const offeringService = {
  async listOfferings(params?: {
    term_id?: string;
    course_id?: string;
    instructor_id?: string;
    status?: string;
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<CourseOffering>> {
    return apiClient.get<PaginatedResponse<CourseOffering>>("/course-offerings", params);
  },

  async getOfferingById(id: string): Promise<CourseOffering> {
    const res = await apiClient.get<ApiResponse<CourseOffering>>(`/course-offerings/${id}`);
    return res.data;
  },

  async createOffering(payload: {
    courseId: string;
    termId: string;
    instructorId?: string;
    sectionCode: string;
    room?: string;
    schedulePattern?: string;
    maxCapacity?: number;
  }): Promise<CourseOffering> {
    const res = await apiClient.post<ApiResponse<CourseOffering>>("/course-offerings", payload);
    return res.data;
  },

  async updateOffering(id: string, payload: Partial<CourseOffering>): Promise<CourseOffering> {
    const res = await apiClient.patch<ApiResponse<CourseOffering>>(`/course-offerings/${id}`, payload);
    return res.data;
  },

  async deleteOffering(id: string): Promise<void> {
    await apiClient.delete(`/course-offerings/${id}`);
  },

  async getRoster(id: string): Promise<{ offering: any; roster: any[] }> {
    const res = await apiClient.get<ApiResponse<any>>(`/course-offerings/${id}/students`);
    if (res.data && Array.isArray(res.data.roster)) {
      return {
        offering: res.data.offering || null,
        roster: res.data.roster,
      };
    }
    if (Array.isArray(res.data)) {
      return {
        offering: null,
        roster: res.data,
      };
    }
    return { offering: null, roster: [] };
  },
};
