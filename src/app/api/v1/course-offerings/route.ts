import { NextRequest } from "next/server";
import { apiHandler } from "@/common/middleware/api-handler";
import { getAuthUser } from "@/common/middleware/auth-guard";
import { requireRole } from "@/common/middleware/role-guard";
import { validateBody, validateQuery } from "@/common/middleware/validate";
import { ApiResponse } from "@/common/responses/api-response";
import { createOfferingSchema, offeringQuerySchema } from "@/modules/offerings/offering.schema";
import { OfferingService } from "@/modules/offerings/offering.service";

import prisma from "@/common/db/prisma";

export const GET = apiHandler(async (req: NextRequest) => {
  const query = validateQuery(offeringQuerySchema, req);

  // If request contains Bearer token and belongs to an INSTRUCTOR, scope offerings to only their assigned courses
  try {
    const currentUser = getAuthUser(req);
    if (currentUser.role === "INSTRUCTOR") {
      let instructorId = currentUser.instructorId;
      if (!instructorId) {
        const inst = await prisma.instructor.findUnique({ where: { userId: currentUser.sub } });
        instructorId = inst?.id;
      }
      if (!instructorId) {
        return ApiResponse.paginated([], 1, query.limit || 10, 0);
      }
      query.instructorId = instructorId;
      query.instructor_id = instructorId;
    }
  } catch {
    // Public or unauthenticated request
  }

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
