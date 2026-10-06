import { NextRequest } from "next/server";
import { apiHandler } from "@/common/middleware/api-handler";
import { getAuthUser } from "@/common/middleware/auth-guard";
import { requireRole } from "@/common/middleware/role-guard";
import { validateBody, validateParams } from "@/common/middleware/validate";
import { ApiResponse } from "@/common/responses/api-response";
import { updateOfferingSchema } from "@/modules/offerings/offering.schema";
import { OfferingService } from "@/modules/offerings/offering.service";
import { z } from "zod";

const paramsSchema = z.object({
  id: z.string().uuid("Invalid Course Offering ID format"),
});

export const GET = apiHandler(async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await validateParams(paramsSchema, params);
  const offering = await OfferingService.getOfferingById(id);
  return ApiResponse.success(offering);
});

export const PATCH = apiHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const currentUser = getAuthUser(req);
  requireRole(currentUser, ["ADMINISTRATOR", "REGISTRAR"]);

  const { id } = await validateParams(paramsSchema, params);
  const body = await validateBody(updateOfferingSchema, req);
  const updated = await OfferingService.updateOffering(id, body);
  return ApiResponse.success(updated, { message: "Course Offering updated successfully" });
});

export const PUT = PATCH;

export const DELETE = apiHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const currentUser = getAuthUser(req);
  requireRole(currentUser, ["ADMINISTRATOR", "REGISTRAR"]);

  const { id } = await validateParams(paramsSchema, params);
  await OfferingService.deleteOffering(id);
  return ApiResponse.noContent();
});
