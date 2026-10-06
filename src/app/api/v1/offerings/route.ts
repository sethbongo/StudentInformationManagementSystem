import { NextRequest } from "next/server";
import { apiHandler } from "@/common/middleware/api-handler";
import { getAuthUser } from "@/common/middleware/auth-guard";
import { requireRole } from "@/common/middleware/role-guard";
import { validateBody, validateQuery } from "@/common/middleware/validate";
import { ApiResponse } from "@/common/responses/api-response";
import { createOfferingSchema, offeringQuerySchema } from "@/modules/offerings/offering.schema";
import { OfferingService } from "@/modules/offerings/offering.service";

export const GET = apiHandler(async (req: NextRequest) => {
  const query = validateQuery(offeringQuerySchema, req);
  const { offerings, total, page, limit } = await OfferingService.listOfferings(query);
  return ApiResponse.paginated(offerings, page, limit, total);
});

export const POST = apiHandler(async (req: NextRequest) => {
  const currentUser = getAuthUser(req);
  requireRole(currentUser, ["ADMINISTRATOR", "REGISTRAR"]);

  const body = await validateBody(createOfferingSchema, req);
  const offering = await OfferingService.createOffering(body);
  return ApiResponse.created(offering, { message: "Course Offering created successfully" });
});
