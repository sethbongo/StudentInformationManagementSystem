import { NextRequest } from "next/server";
import { apiHandler } from "@/common/middleware/api-handler";
import { getAuthUser } from "@/common/middleware/auth-guard";
import { ApiResponse } from "@/common/responses/api-response";
import { AuthService } from "@/modules/auth/auth.service";

export const GET = apiHandler(async (req: NextRequest) => {
  const currentUser = getAuthUser(req);
  const profile = await AuthService.getMe(currentUser.sub);
  return ApiResponse.success(profile);
});
