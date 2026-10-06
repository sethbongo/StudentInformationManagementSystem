import { NextRequest } from "next/server";
import { apiHandler } from "@/common/middleware/api-handler";
import { getAuthUser } from "@/common/middleware/auth-guard";
import { requireRole } from "@/common/middleware/role-guard";
import { validateBody, validateParams } from "@/common/middleware/validate";
import { ApiResponse } from "@/common/responses/api-response";
import { updateProgramSchema } from "@/modules/programs/program.schema";
import { ProgramService } from "@/modules/programs/program.service";
import { z } from "zod";

const paramsSchema = z.object({
  id: z.string().uuid("Invalid Program ID format"),
});

export const GET = apiHandler(async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await validateParams(paramsSchema, params);
  const program = await ProgramService.getProgramById(id);
  return ApiResponse.success(program);
});

export const PATCH = apiHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const currentUser = getAuthUser(req);
  requireRole(currentUser, ["ADMINISTRATOR", "REGISTRAR"]);

  const { id } = await validateParams(paramsSchema, params);
  const body = await validateBody(updateProgramSchema, req);
  const updated = await ProgramService.updateProgram(id, body);
  return ApiResponse.success(updated, { message: "Academic Program updated successfully" });
});

export const PUT = PATCH;

export const DELETE = apiHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const currentUser = getAuthUser(req);
  requireRole(currentUser, ["ADMINISTRATOR", "REGISTRAR"]);

  const { id } = await validateParams(paramsSchema, params);
  await ProgramService.deleteProgram(id);
  return ApiResponse.noContent();
});
