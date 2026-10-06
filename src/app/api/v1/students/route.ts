import { NextRequest } from "next/server";
import { apiHandler } from "@/common/middleware/api-handler";
import { getAuthUser } from "@/common/middleware/auth-guard";
import { requireRole } from "@/common/middleware/role-guard";
import { validateBody, validateQuery } from "@/common/middleware/validate";
import { ApiResponse } from "@/common/responses/api-response";
import { createStudentSchema, studentQuerySchema } from "@/modules/students/student.schema";
import { StudentService } from "@/modules/students/student.service";

export const GET = apiHandler(async (req: NextRequest) => {
  const currentUser = getAuthUser(req);
  requireRole(currentUser, ["ADMINISTRATOR", "REGISTRAR", "INSTRUCTOR"]);

  const query = validateQuery(studentQuerySchema, req);
  const { students, total, page, limit } = await StudentService.listStudents(query);
  return ApiResponse.paginated(students, page, limit, total);
});

export const POST = apiHandler(async (req: NextRequest) => {
  const currentUser = getAuthUser(req);
  requireRole(currentUser, ["ADMINISTRATOR", "REGISTRAR"]);

  const body = await validateBody(createStudentSchema, req);
  const student = await StudentService.createStudent(body);
  return ApiResponse.created(student, { message: "Student profile created successfully" });
});
