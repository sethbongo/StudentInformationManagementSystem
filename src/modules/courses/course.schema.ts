import { z } from "zod";

export const createCourseSchema = z.object({
  code: z.string().min(2, "Course code must be at least 2 characters").max(20),
  title: z.string().min(3, "Course title is required"),
  description: z.string().optional(),
  units: z.coerce.number().int().min(1, "Course must have at least 1 unit").max(10).default(3),
  programId: z.string().uuid("Invalid Program ID format").optional().nullable(),
  isActive: z.boolean().default(true),
  prerequisiteCourseIds: z.array(z.string().uuid()).optional(),
});

export const updateCourseSchema = z.object({
  code: z.string().min(2).max(20).optional(),
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  units: z.coerce.number().int().min(1).max(10).optional(),
  programId: z.string().uuid().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const courseQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  per_page: z.coerce.number().int().positive().max(100).optional(),
  programId: z.string().optional(),
  program_id: z.string().optional(),
  search: z.string().optional(),
  isActive: z.enum(["true", "false"]).optional(),
  sort: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export const addPrerequisiteSchema = z.object({
  prerequisiteId: z.string().uuid("Invalid Prerequisite Course ID"),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type CourseQueryInput = z.infer<typeof courseQuerySchema>;
export type AddPrerequisiteInput = z.infer<typeof addPrerequisiteSchema>;
