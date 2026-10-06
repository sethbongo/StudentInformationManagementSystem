import { NextRequest } from "next/server";
import { apiHandler } from "@/common/middleware/api-handler";
import { getAuthUser } from "@/common/middleware/auth-guard";
import { requireRole } from "@/common/middleware/role-guard";
import { validateBody, validateQuery } from "@/common/middleware/validate";
import { ApiResponse } from "@/common/responses/api-response";
import { createUserSchema, userQuerySchema } from "@/modules/users/user.schema";
import { UserService } from "@/modules/users/user.service";

export const GET = apiHandler(async (req: NextRequest) => {
  const currentUser = getAuthUser(req);
  requireRole(currentUser, ["ADMINISTRATOR", "REGISTRAR"]);

  const query = validateQuery(userQuerySchema, req);
  const { users, total, page, limit } = await UserService.listUsers(query);
  return ApiResponse.paginated(users, page, limit, total);
});

export const POST = apiHandler(async (req: NextRequest) => {
  const currentUser = getAuthUser(req);
  requireRole(currentUser, ["ADMINISTRATOR"]);

  const body = await validateBody(createUserSchema, req);
  const user = await UserService.createUser(body);
  return ApiResponse.created(user, { message: "User account created successfully" });
});
