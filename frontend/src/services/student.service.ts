import { apiClient } from "./api-client";
import { ApiResponse, PaginatedResponse } from "../types/api";
import { Student, Enrollment, Grade, AcademicRecord } from "../types/entities";

export interface StudentQueryParams {
  page?: number;
  per_page?: number;
  limit?: number;
  search?: string;
  program_id?: string;
  year_level?: number;
  status?: string;
  sort?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateStudentPayload {
  studentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  programId: string;
  yearLevel?: number;
  status?: string;
  middleName?: string;
  suffix?: string;
  contactNumber?: string;
  address?: string;
}

export interface UpdateStudentPayload {
  firstName?: string;
  lastName?: string;
  programId?: string;
  yearLevel?: number;
  status?: string;
  middleName?: string;
  suffix?: string;
  contactNumber?: string;
  address?: string;
}

export const studentService = {
  async listStudents(params?: StudentQueryParams): Promise<PaginatedResponse<Student>> {
    return apiClient.get<PaginatedResponse<Student>>("/students", params);
  },

  async getStudentById(id: string): Promise<Student> {
    const res = await apiClient.get<ApiResponse<Student>>(`/students/${id}`);
    return res.data;
  },

  async createStudent(payload: CreateStudentPayload): Promise<Student> {
    const res = await apiClient.post<ApiResponse<Student>>("/students", payload);
    return res.data;
  },

  async updateStudent(id: string, payload: UpdateStudentPayload): Promise<Student> {
    const res = await apiClient.patch<ApiResponse<Student>>(`/students/${id}`, payload);
    return res.data;
  },

  async deleteStudent(id: string): Promise<void> {
    await apiClient.delete(`/students/${id}`);
  },

  async getAcademicRecord(id: string): Promise<AcademicRecord> {
    const res = await apiClient.get<ApiResponse<AcademicRecord>>(`/students/${id}/academic-record`);
    return res.data;
  },

  async getGrades(id: string): Promise<Grade[]> {
    const res = await apiClient.get<ApiResponse<Grade[]>>(`/students/${id}/grades`);
    return res.data;
  },

  async getEnrollments(id: string): Promise<PaginatedResponse<Enrollment>> {
    return apiClient.get<PaginatedResponse<Enrollment>>(`/students/${id}/enrollments`);
  },
};
