import { z } from "zod";

export const submitGradeSchema = z.object({
  enrollmentId: z.string().uuid("Invalid Enrollment ID").optional(),
  enrollment_id: z.string().uuid("Invalid Enrollment ID").optional(),
  numericGrade: z.coerce.number().min(1.0).max(5.0).optional().nullable(),
  numeric_grade: z.coerce.number().min(1.0).max(5.0).optional().nullable(),
  midtermGrade: z.coerce.number().min(1.0).max(5.0).optional().nullable(),
  midterm_grade: z.coerce.number().min(1.0).max(5.0).optional().nullable(),
  finalGrade: z.coerce.number().min(1.0).max(5.0).optional().nullable(),
  final_grade: z.coerce.number().min(1.0).max(5.0).optional().nullable(),
  letterGrade: z.string().max(5).optional().nullable(),
  remarks: z.enum(["PASSED", "FAILED", "INCOMPLETE", "DROPPED"]).default("PASSED"),
  isFinalized: z.boolean().default(false),
}).refine((data) => data.enrollmentId || data.enrollment_id, {
  message: "Enrollment ID is required",
  path: ["enrollmentId"],
});

export const updateGradeSchema = z.object({
  numericGrade: z.coerce.number().min(1.0).max(5.0).optional().nullable(),
  numeric_grade: z.coerce.number().min(1.0).max(5.0).optional().nullable(),
  midtermGrade: z.coerce.number().min(1.0).max(5.0).optional().nullable(),
  midterm_grade: z.coerce.number().min(1.0).max(5.0).optional().nullable(),
  finalGrade: z.coerce.number().min(1.0).max(5.0).optional().nullable(),
  final_grade: z.coerce.number().min(1.0).max(5.0).optional().nullable(),
  letterGrade: z.string().max(5).optional().nullable(),
  remarks: z.enum(["PASSED", "FAILED", "INCOMPLETE", "DROPPED"]).optional(),
  isFinalized: z.boolean().optional(),
});

export const gradeQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  per_page: z.coerce.number().int().positive().max(100).optional(),
  offeringId: z.string().optional(),
  offering_id: z.string().optional(),
  studentId: z.string().optional(),
  student_id: z.string().optional(),
  remarks: z.enum(["PASSED", "FAILED", "INCOMPLETE", "DROPPED"]).optional(),
  isFinalized: z.enum(["true", "false"]).optional(),
  is_finalized: z.enum(["true", "false"]).optional(),
  sort: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export type SubmitGradeInput = z.input<typeof submitGradeSchema>;
export type UpdateGradeInput = z.input<typeof updateGradeSchema>;
export type GradeQueryInput = z.input<typeof gradeQuerySchema>;
