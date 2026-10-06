import { NextRequest } from "next/server";
import { apiHandler } from "@/common/middleware/api-handler";
import { getAuthUser } from "@/common/middleware/auth-guard";
import { requireRole } from "@/common/middleware/role-guard";
import { validateParams } from "@/common/middleware/validate";
import { ApiResponse } from "@/common/responses/api-response";
import { OfferingService } from "@/modules/offerings/offering.service";
import { z } from "zod";

const paramsSchema = z.object({
  id: z.string().uuid("Invalid Course Offering ID format"),
});

export const GET = apiHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const currentUser = getAuthUser(req);
  requireRole(currentUser, ["ADMINISTRATOR", "REGISTRAR", "INSTRUCTOR"]);

  const { id } = await validateParams(paramsSchema, params);
  const rosterData = await OfferingService.getRoster(id, currentUser);
  return ApiResponse.success(rosterData);
});
