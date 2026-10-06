import { NextRequest } from "next/server";
import { apiHandler } from "@/common/middleware/api-handler";
import { getAuthUser } from "@/common/middleware/auth-guard";
import { requireRole } from "@/common/middleware/role-guard";
import { validateBody, validateParams } from "@/common/middleware/validate";
import { ApiResponse } from "@/common/responses/api-response";
import { updateCourseSchema } from "@/modules/courses/course.schema";
import { CourseService } from "@/modules/courses/course.service";
import { z } from "zod";

const paramsSchema = z.object({
  id: z.string().uuid("Invalid Course ID format"),
});

export const GET = apiHandler(async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await validateParams(paramsSchema, params);
  const course = await CourseService.getCourseById(id);
  return ApiResponse.success(course);
});

export const PATCH = apiHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const currentUser = getAuthUser(req);
  requireRole(currentUser, ["ADMINISTRATOR", "REGISTRAR"]);

  const { id } = await validateParams(paramsSchema, params);
  const body = await validateBody(updateCourseSchema, req);
  const updated = await CourseService.updateCourse(id, body);
  return ApiResponse.success(updated, { message: "Course updated successfully" });
});

export const PUT = PATCH;

export const DELETE = apiHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const currentUser = getAuthUser(req);
  requireRole(currentUser, ["ADMINISTRATOR", "REGISTRAR"]);

  const { id } = await validateParams(paramsSchema, params);
  await CourseService.deleteCourse(id);
  return ApiResponse.noContent();
});
