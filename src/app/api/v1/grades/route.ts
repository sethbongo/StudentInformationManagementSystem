import { NextRequest } from "next/server";
import { apiHandler } from "@/common/middleware/api-handler";
import { getAuthUser } from "@/common/middleware/auth-guard";
import { requireRole } from "@/common/middleware/role-guard";
import { validateBody, validateQuery } from "@/common/middleware/validate";
import { ApiResponse } from "@/common/responses/api-response";
import { submitGradeSchema, gradeQuerySchema } from "@/modules/grades/grade.schema";
import { GradeService } from "@/modules/grades/grade.service";

export const GET = apiHandler(async (req: NextRequest) => {
  const currentUser = getAuthUser(req);
  requireRole(currentUser, ["ADMINISTRATOR", "REGISTRAR", "INSTRUCTOR"]);

  const query = validateQuery(gradeQuerySchema, req);
  const { grades, total, page, limit } = await GradeService.listGrades(query);
  return ApiResponse.paginated(grades, page, limit, total);
});

export const POST = apiHandler(async (req: NextRequest) => {
  const currentUser = getAuthUser(req);
  requireRole(currentUser, ["ADMINISTRATOR", "REGISTRAR", "INSTRUCTOR"]);

  const body = await validateBody(submitGradeSchema, req);
  const grade = await GradeService.submitGrade(body, currentUser);
  return ApiResponse.created(grade, { message: "Grade submitted successfully" });
});
