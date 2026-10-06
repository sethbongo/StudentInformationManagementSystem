import { z } from "zod";

export const createProgramSchema = z.object({
  code: z.string().min(2, "Program code must be at least 2 characters").max(20),
  name: z.string().min(3, "Program name must be at least 3 characters"),
  department: z.string().min(2, "Department is required"),
  totalUnitsRequired: z.coerce.number().int().positive().default(120),
  isActive: z.boolean().default(true),
});

export const updateProgramSchema = z.object({
  code: z.string().min(2).max(20).optional(),
  name: z.string().min(3).optional(),
  department: z.string().min(2).optional(),
  totalUnitsRequired: z.coerce.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

export const programQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  per_page: z.coerce.number().int().positive().max(100).optional(),
  department: z.string().optional(),
  search: z.string().optional(),
  isActive: z.enum(["true", "false"]).optional(),
  sort: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export type CreateProgramInput = z.infer<typeof createProgramSchema>;
export type UpdateProgramInput = z.infer<typeof updateProgramSchema>;
export type ProgramQueryInput = z.infer<typeof programQuerySchema>;
