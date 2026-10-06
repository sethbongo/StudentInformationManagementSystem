import { NextRequest } from "next/server";
import { apiHandler } from "@/common/middleware/api-handler";
import { getAuthUser } from "@/common/middleware/auth-guard";
import { requireRole } from "@/common/middleware/role-guard";
import { validateBody, validateParams } from "@/common/middleware/validate";
import { ApiResponse } from "@/common/responses/api-response";
import { updateUserSchema } from "@/modules/users/user.schema";
import { UserService } from "@/modules/users/user.service";
import { z } from "zod";

const paramsSchema = z.object({
  id: z.string().uuid("Invalid User ID format"),
});

export const GET = apiHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const currentUser = getAuthUser(req);
  const { id } = await validateParams(paramsSchema, params);

  // User can view self; otherwise Admin/Registrar required
  if (currentUser.role !== "ADMINISTRATOR" && currentUser.role !== "REGISTRAR" && currentUser.sub !== id) {
    requireRole(currentUser, ["ADMINISTRATOR", "REGISTRAR"]);
  }

  const user = await UserService.getUserById(id);
  return ApiResponse.success(user);
});

export const PATCH = apiHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const currentUser = getAuthUser(req);
  requireRole(currentUser, ["ADMINISTRATOR"]);

  const { id } = await validateParams(paramsSchema, params);
  const body = await validateBody(updateUserSchema, req);
  const updatedUser = await UserService.updateUser(id, body);
  return ApiResponse.success(updatedUser, { message: "User updated successfully" });
});

export const PUT = PATCH;

export const DELETE = apiHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const currentUser = getAuthUser(req);
  requireRole(currentUser, ["ADMINISTRATOR"]);

  const { id } = await validateParams(paramsSchema, params);
  await UserService.deleteUser(id);
  return ApiResponse.noContent();
});
