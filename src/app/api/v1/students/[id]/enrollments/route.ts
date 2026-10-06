import { NextRequest } from "next/server";
import { apiHandler } from "@/common/middleware/api-handler";
import { getAuthUser } from "@/common/middleware/auth-guard";
import { validateParams, validateQuery } from "@/common/middleware/validate";
import { ApiResponse } from "@/common/responses/api-response";
import { enrollmentQuerySchema } from "@/modules/enrollments/enrollment.schema";
import { EnrollmentService } from "@/modules/enrollments/enrollment.service";
import { z } from "zod";

const paramsSchema = z.object({
  id: z.string().uuid("Invalid Student ID format"),
});

export const GET = apiHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const currentUser = getAuthUser(req);
  const { id } = await validateParams(paramsSchema, params);
  const query = validateQuery(enrollmentQuerySchema, req);

  const { enrollments, total, page, limit } = await EnrollmentService.listEnrollments(
    { ...query, studentId: id },
    currentUser
  );

  return ApiResponse.paginated(enrollments, page, limit, total);
});
