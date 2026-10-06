import { NextRequest } from "next/server";
import { apiHandler } from "@/common/middleware/api-handler";
import { getAuthUser } from "@/common/middleware/auth-guard";
import { requireRole } from "@/common/middleware/role-guard";
import { validateBody, validateQuery } from "@/common/middleware/validate";
import { ApiResponse } from "@/common/responses/api-response";
import { createTermSchema, termQuerySchema } from "@/modules/terms/term.schema";
import { TermService } from "@/modules/terms/term.service";

export const GET = apiHandler(async (req: NextRequest) => {
  const query = validateQuery(termQuerySchema, req);
  const { terms, total, page, limit } = await TermService.listTerms(query);
  return ApiResponse.paginated(terms, page, limit, total);
});

export const POST = apiHandler(async (req: NextRequest) => {
  const currentUser = getAuthUser(req);
  requireRole(currentUser, ["ADMINISTRATOR", "REGISTRAR"]);

  const body = await validateBody(createTermSchema, req);
  const term = await TermService.createTerm(body);
  return ApiResponse.created(term, { message: "Academic Term created successfully" });
});
