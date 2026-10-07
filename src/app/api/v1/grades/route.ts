import { NextRequest } from "next/server";
import { apiHandler } from "@/common/middleware/api-handler";
import { getAuthUser } from "@/common/middleware/auth-guard";
import { requireRole } from "@/common/middleware/role-guard";
import { validateBody, validateQuery } from "@/common/middleware/validate";
import { ApiResponse } from "@/common/responses/api-response";
import { submitGradeSchema, gradeQuerySchema } from "@/modules/grades/grade.schema";
import { GradeService } from "@/modules/grades/grade.service";

import prisma from "@/common/db/prisma";

export const GET = apiHandler(async (req: NextRequest) => {
  const currentUser = getAuthUser(req);
  requireRole(currentUser, ["ADMINISTRATOR", "REGISTRAR", "INSTRUCTOR", "STUDENT"]);

  const query = validateQuery(gradeQuerySchema, req);
  if (currentUser.role === "STUDENT") {
    let studentId = currentUser.studentId;
    if (!studentId) {
      const student = await prisma.student.findUnique({ where: { userId: currentUser.sub } });
      studentId = student?.id;
    }
    if (!studentId) {
      return ApiResponse.paginated([], 1, query.limit || 10, 0);
    }
    query.studentId = studentId;
    query.student_id = studentId;
  }
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
