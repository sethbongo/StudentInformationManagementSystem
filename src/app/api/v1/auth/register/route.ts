import { NextRequest } from "next/server";
import { apiHandler } from "@/common/middleware/api-handler";
import { validateBody } from "@/common/middleware/validate";
import { ApiResponse } from "@/common/responses/api-response";
import { registerSchema } from "@/modules/auth/auth.schema";
import { AuthService } from "@/modules/auth/auth.service";

export const POST = apiHandler(async (req: NextRequest) => {
  const body = await validateBody(registerSchema, req);
  const result = await AuthService.register(body);
  return ApiResponse.created(result, { message: "User registered successfully" });
});
