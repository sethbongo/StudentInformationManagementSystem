import { NextRequest } from "next/server";
import { apiHandler } from "@/common/middleware/api-handler";
import { getAuthUser } from "@/common/middleware/auth-guard";
import { ApiResponse } from "@/common/responses/api-response";

export const POST = apiHandler(async (req: NextRequest) => {
  const currentUser = getAuthUser(req);
  return ApiResponse.success(
    { loggedOut: true, userId: currentUser.sub },
    { message: "User successfully logged out and session invalidated" }
  );
});
