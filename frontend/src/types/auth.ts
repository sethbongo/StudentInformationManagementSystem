export type Role = "ADMINISTRATOR" | "REGISTRAR" | "INSTRUCTOR" | "STUDENT";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive: boolean;
  studentId?: string | null;
  studentNumber?: string | null;
  instructorId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: User;
  token?: string;
  accessToken?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
