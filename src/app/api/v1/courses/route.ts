import { NextRequest } from "next/server";
import { apiHandler } from "@/common/middleware/api-handler";
import { getAuthUser } from "@/common/middleware/auth-guard";
import { requireRole } from "@/common/middleware/role-guard";
import { validateBody, validateQuery } from "@/common/middleware/validate";
import { ApiResponse } from "@/common/responses/api-response";
import { createCourseSchema, courseQuerySchema } from "@/modules/courses/course.schema";
import { CourseService } from "@/modules/courses/course.service";

export const GET = apiHandler(async (req: NextRequest) => {
  const query = validateQuery(courseQuerySchema, req);
  const { courses, total, page, limit } = await CourseService.listCourses(query);
  return ApiResponse.paginated(courses, page, limit, total);
});

export const POST = apiHandler(async (req: NextRequest) => {
  const currentUser = getAuthUser(req);
  requireRole(currentUser, ["ADMINISTRATOR", "REGISTRAR"]);

  const body = await validateBody(createCourseSchema, req);
  const course = await CourseService.createCourse(body);
  return ApiResponse.created(course, { message: "Course created successfully" });
});
