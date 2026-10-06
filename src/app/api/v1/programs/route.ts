import { NextRequest } from "next/server";
import { apiHandler } from "@/common/middleware/api-handler";
import { getAuthUser } from "@/common/middleware/auth-guard";
import { requireRole } from "@/common/middleware/role-guard";
import { validateBody, validateQuery } from "@/common/middleware/validate";
import { ApiResponse } from "@/common/responses/api-response";
import { createProgramSchema, programQuerySchema } from "@/modules/programs/program.schema";
import { ProgramService } from "@/modules/programs/program.service";

export const GET = apiHandler(async (req: NextRequest) => {
  // Publicly readable or accessible to all authenticated roles
  const query = validateQuery(programQuerySchema, req);
  const { programs, total, page, limit } = await ProgramService.listPrograms(query);
  return ApiResponse.paginated(programs, page, limit, total);
});

export const POST = apiHandler(async (req: NextRequest) => {
  const currentUser = getAuthUser(req);
  requireRole(currentUser, ["ADMINISTRATOR", "REGISTRAR"]);

  const body = await validateBody(createProgramSchema, req);
  const program = await ProgramService.createProgram(body);
  return ApiResponse.created(program, { message: "Academic Program created successfully" });
});
