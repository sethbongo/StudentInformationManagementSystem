import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(["ADMINISTRATOR", "REGISTRAR", "INSTRUCTOR", "STUDENT"]).default("STUDENT"),
  // If role is STUDENT, optional initial programId and studentNumber
  programId: z.string().uuid("Invalid Program ID format").optional(),
  studentNumber: z.string().optional(),
  // If role is INSTRUCTOR
  department: z.string().optional(),
  employeeNumber: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
