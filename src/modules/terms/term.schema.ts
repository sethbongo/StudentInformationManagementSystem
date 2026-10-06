import { z } from "zod";

export const createTermSchema = z.object({
  code: z.string().min(2, "Term code must be at least 2 characters").max(20),
  name: z.string().min(3, "Term name is required"),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  isEnrollmentOpen: z.boolean().default(false),
  isCurrent: z.boolean().default(false),
}).refine((data) => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
});

export const updateTermSchema = z.object({
  code: z.string().min(2).max(20).optional(),
  name: z.string().min(3).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  isEnrollmentOpen: z.boolean().optional(),
  isCurrent: z.boolean().optional(),
});

export const termQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  per_page: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().optional(),
  isCurrent: z.enum(["true", "false"]).optional(),
  isEnrollmentOpen: z.enum(["true", "false"]).optional(),
  sort: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export type CreateTermInput = z.infer<typeof createTermSchema>;
export type UpdateTermInput = z.infer<typeof updateTermSchema>;
export type TermQueryInput = z.infer<typeof termQuerySchema>;
