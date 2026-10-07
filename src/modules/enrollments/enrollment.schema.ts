import { z } from "zod";

export const createEnrollmentSchema = z.object({
  studentId: z.string().uuid("Invalid Student ID").optional(),
  student_id: z.string().uuid("Invalid Student ID").optional(),
  courseOfferingId: z.string().uuid("Invalid Course Offering ID").optional(),
  course_offering_id: z.string().uuid("Invalid Course Offering ID").optional(),
}).refine((data) => data.courseOfferingId || data.course_offering_id, {
  message: "Course Offering ID is required",
  path: ["courseOfferingId"],
});

export const updateEnrollmentStatusSchema = z.object({
  status: z.enum(["ENROLLED", "DROPPED", "CANCELLED"]),
});

export const enrollmentQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  per_page: z.coerce.number().int().positive().max(100).optional(),
  studentId: z.string().optional(),
  student_id: z.string().optional(),
  courseOfferingId: z.string().optional(),
  course_offering_id: z.string().optional(),
  courseId: z.string().optional(),
  course_id: z.string().optional(),
  search: z.string().optional(),
  termId: z.string().optional(),
  term_id: z.string().optional(),
  status: z.enum(["ENROLLED", "DROPPED", "COMPLETED", "CANCELLED"]).optional(),
  sort: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>;
export type UpdateEnrollmentStatusInput = z.infer<typeof updateEnrollmentStatusSchema>;
export type EnrollmentQueryInput = z.infer<typeof enrollmentQuerySchema>;
