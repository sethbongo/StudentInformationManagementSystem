import { NextRequest } from "next/server";
import { apiHandler } from "@/common/middleware/api-handler";
import { getAuthUser } from "@/common/middleware/auth-guard";
import { validateParams } from "@/common/middleware/validate";
import { ApiResponse } from "@/common/responses/api-response";
import { StudentService } from "@/modules/students/student.service";
import { z } from "zod";

const paramsSchema = z.object({
  id: z.string().uuid("Invalid Student ID format"),
});

export const GET = apiHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const currentUser = getAuthUser(req);
  const { id } = await validateParams(paramsSchema, params);
  const grades = await StudentService.getStudentGrades(id, currentUser);
  return ApiResponse.success(grades, { message: "Student grades retrieved successfully" });
});
