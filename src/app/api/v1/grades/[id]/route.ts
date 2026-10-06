import { NextRequest } from "next/server";
import { apiHandler } from "@/common/middleware/api-handler";
import { getAuthUser } from "@/common/middleware/auth-guard";
import { requireRole } from "@/common/middleware/role-guard";
import { validateBody, validateParams } from "@/common/middleware/validate";
import { ApiResponse } from "@/common/responses/api-response";
import { updateGradeSchema } from "@/modules/grades/grade.schema";
import { GradeService } from "@/modules/grades/grade.service";
import { z } from "zod";

const paramsSchema = z.object({
  id: z.string().uuid("Invalid Grade ID format"),
});

export const GET = apiHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const currentUser = getAuthUser(req);
  const { id } = await validateParams(paramsSchema, params);
  const grade = await GradeService.getGradeById(id, currentUser);
  return ApiResponse.success(grade);
});

export const PATCH = apiHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const currentUser = getAuthUser(req);
  requireRole(currentUser, ["ADMINISTRATOR", "REGISTRAR", "INSTRUCTOR"]);

  const { id } = await validateParams(paramsSchema, params);
  const body = await validateBody(updateGradeSchema, req);
  const updated = await GradeService.updateGrade(id, body, currentUser);
  return ApiResponse.success(updated, { message: "Grade updated successfully" });
});

export const PUT = PATCH;

export const DELETE = apiHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const currentUser = getAuthUser(req);
  const { id } = await validateParams(paramsSchema, params);
  await GradeService.deleteGrade(id, currentUser);
  return ApiResponse.noContent();
});
