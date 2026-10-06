import { NextRequest } from "next/server";
import { apiHandler } from "@/common/middleware/api-handler";
import { getAuthUser } from "@/common/middleware/auth-guard";
import { requireRole } from "@/common/middleware/role-guard";
import { validateBody, validateParams } from "@/common/middleware/validate";
import { ApiResponse } from "@/common/responses/api-response";
import { addPrerequisiteSchema } from "@/modules/courses/course.schema";
import { CourseService } from "@/modules/courses/course.service";
import { z } from "zod";

const paramsSchema = z.object({
  id: z.string().uuid("Invalid Course ID format"),
});

export const POST = apiHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const currentUser = getAuthUser(req);
  requireRole(currentUser, ["ADMINISTRATOR", "REGISTRAR"]);

  const { id } = await validateParams(paramsSchema, params);
  const body = await validateBody(addPrerequisiteSchema, req);
  const result = await CourseService.addPrerequisite(id, body.prerequisiteId);
  return ApiResponse.created(result, { message: "Prerequisite added successfully" });
});

export const DELETE = apiHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const currentUser = getAuthUser(req);
  requireRole(currentUser, ["ADMINISTRATOR", "REGISTRAR"]);

  const { id } = await validateParams(paramsSchema, params);
  const { searchParams } = new URL(req.url);
  const prerequisiteId = searchParams.get("prerequisiteId");

  if (!prerequisiteId) {
    const body = await req.json();
    await CourseService.removePrerequisite(id, body.prerequisiteId);
  } else {
    await CourseService.removePrerequisite(id, prerequisiteId);
  }

  return ApiResponse.noContent();
});
