import { z } from "zod";

export const createOfferingSchema = z.object({
  courseId: z.string().uuid("Invalid Course ID"),
  termId: z.string().uuid("Invalid Term ID"),
  instructorId: z.string().uuid("Invalid Instructor ID").optional().nullable(),
  sectionCode: z.string().min(1, "Section code is required"),
  schedule: z.string().min(1, "Schedule is required (e.g. MW 09:00-10:30 AM)"),
  room: z.string().min(1, "Room location is required"),
  maxCapacity: z.coerce.number().int().positive().max(500).default(40),
});

export const updateOfferingSchema = z.object({
  instructorId: z.string().uuid().optional().nullable(),
  sectionCode: z.string().min(1).optional(),
  schedule: z.string().min(1).optional(),
  room: z.string().min(1).optional(),
  maxCapacity: z.coerce.number().int().positive().max(500).optional(),
});

export const offeringQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  per_page: z.coerce.number().int().positive().max(100).optional(),
  termId: z.string().optional(),
  term_id: z.string().optional(),
  courseId: z.string().optional(),
  course_id: z.string().optional(),
  instructorId: z.string().optional(),
  instructor_id: z.string().optional(),
  search: z.string().optional(),
  sort: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export type CreateOfferingInput = z.infer<typeof createOfferingSchema>;
export type UpdateOfferingInput = z.infer<typeof updateOfferingSchema>;
export type OfferingQueryInput = z.infer<typeof offeringQuerySchema>;
