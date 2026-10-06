import { z } from "zod";

export const createStudentSchema = z.object({
  studentNumber: z.string().min(3, "Student number is required"),
  programId: z.string().uuid("Invalid Program ID"),
  userId: z.string().uuid("Invalid User ID").optional(),
  
  // Direct user profile fields (satisfies Section 10 & Demo 5)
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  middleName: z.string().optional(),
  suffix: z.string().optional(),
  email: z.string().email("A valid email address is required").optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),

  yearLevel: z.coerce.number().int().min(1).max(6).default(1),
  status: z.enum(["ACTIVE", "INACTIVE", "PROBATION", "GRADUATED", "DROPPED_OUT"]).default("ACTIVE"),
  dateOfBirth: z.coerce.date().optional(),
  contactNumber: z.string().optional(),
  address: z.string().optional(),
});

export const updateStudentSchema = z.object({
  programId: z.string().uuid().optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  middleName: z.string().optional(),
  suffix: z.string().optional(),
  email: z.string().email().optional(),
  yearLevel: z.coerce.number().int().min(1).max(6).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "PROBATION", "GRADUATED", "DROPPED_OUT"]).optional(),
  dateOfBirth: z.coerce.date().optional(),
  contactNumber: z.string().optional(),
  address: z.string().optional(),
});

export const studentQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  per_page: z.coerce.number().int().positive().max(100).optional(),
  programId: z.string().optional(),
  program_id: z.string().optional(),
  yearLevel: z.coerce.number().int().optional(),
  year_level: z.coerce.number().int().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "PROBATION", "GRADUATED", "DROPPED_OUT"]).optional(),
  search: z.string().optional(),
  sort: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export type CreateStudentInput = z.input<typeof createStudentSchema>;
export type UpdateStudentInput = z.input<typeof updateStudentSchema>;
export type StudentQueryInput = z.input<typeof studentQuerySchema>;
