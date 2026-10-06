import { NextRequest } from "next/server";
import { apiHandler } from "@/common/middleware/api-handler";
import { getAuthUser } from "@/common/middleware/auth-guard";
import { validateBody, validateQuery } from "@/common/middleware/validate";
import { ApiResponse } from "@/common/responses/api-response";
import { createEnrollmentSchema, enrollmentQuerySchema } from "@/modules/enrollments/enrollment.schema";
import { EnrollmentService } from "@/modules/enrollments/enrollment.service";

export const GET = apiHandler(async (req: NextRequest) => {
  const currentUser = getAuthUser(req);
  const query = validateQuery(enrollmentQuerySchema, req);
  const { enrollments, total, page, limit } = await EnrollmentService.listEnrollments(query, currentUser);
  return ApiResponse.paginated(enrollments, page, limit, total);
});

export const POST = apiHandler(async (req: NextRequest) => {
  const currentUser = getAuthUser(req);
  const body = await validateBody(createEnrollmentSchema, req);
  const enrollment = await EnrollmentService.enrollStudent(body, currentUser);
  return ApiResponse.created(enrollment, { message: "Enrolled in course offering successfully" });
});
