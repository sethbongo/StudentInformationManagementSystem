import { NextRequest } from "next/server";
import { apiHandler } from "@/common/middleware/api-handler";
import { getAuthUser } from "@/common/middleware/auth-guard";
import { requireRole } from "@/common/middleware/role-guard";
import { validateBody, validateParams } from "@/common/middleware/validate";
import { ApiResponse } from "@/common/responses/api-response";
import { updateStudentSchema } from "@/modules/students/student.schema";
import { StudentService } from "@/modules/students/student.service";
import { z } from "zod";

const paramsSchema = z.object({
  id: z.string().uuid("Invalid Student ID format"),
});

export const GET = apiHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const currentUser = getAuthUser(req);
  const { id } = await validateParams(paramsSchema, params);
  const student = await StudentService.getStudentById(id, currentUser);
  return ApiResponse.success(student);
});

export const PATCH = apiHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const currentUser = getAuthUser(req);
  requireRole(currentUser, ["ADMINISTRATOR", "REGISTRAR"]);

  const { id } = await validateParams(paramsSchema, params);
  const body = await validateBody(updateStudentSchema, req);
  const updated = await StudentService.updateStudent(id, body);
  return ApiResponse.success(updated, { message: "Student profile updated successfully" });
});

export const PUT = PATCH;

export const DELETE = apiHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const currentUser = getAuthUser(req);
  requireRole(currentUser, ["ADMINISTRATOR", "REGISTRAR"]);

  const { id } = await validateParams(paramsSchema, params);
  await StudentService.deleteStudent(id);
  return ApiResponse.noContent();
});
