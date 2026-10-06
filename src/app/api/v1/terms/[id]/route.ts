import { NextRequest } from "next/server";
import { apiHandler } from "@/common/middleware/api-handler";
import { getAuthUser } from "@/common/middleware/auth-guard";
import { requireRole } from "@/common/middleware/role-guard";
import { validateBody, validateParams } from "@/common/middleware/validate";
import { ApiResponse } from "@/common/responses/api-response";
import { updateTermSchema } from "@/modules/terms/term.schema";
import { TermService } from "@/modules/terms/term.service";
import { z } from "zod";

const paramsSchema = z.object({
  id: z.string().uuid("Invalid Term ID format"),
});

export const GET = apiHandler(async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await validateParams(paramsSchema, params);
  const term = await TermService.getTermById(id);
  return ApiResponse.success(term);
});

export const PATCH = apiHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const currentUser = getAuthUser(req);
  requireRole(currentUser, ["ADMINISTRATOR", "REGISTRAR"]);

  const { id } = await validateParams(paramsSchema, params);
  const body = await validateBody(updateTermSchema, req);
  const updated = await TermService.updateTerm(id, body);
  return ApiResponse.success(updated, { message: "Academic Term updated successfully" });
});

export const PUT = PATCH;

export const DELETE = apiHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const currentUser = getAuthUser(req);
  requireRole(currentUser, ["ADMINISTRATOR", "REGISTRAR"]);

  const { id } = await validateParams(paramsSchema, params);
  await TermService.deleteTerm(id);
  return ApiResponse.noContent();
});
