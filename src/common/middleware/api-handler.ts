import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "../errors/error-handler";

type RouteHandler<T = any> = (
  req: NextRequest,
  context: T
) => Promise<NextResponse>;

export function apiHandler<T = any>(handler: RouteHandler<T>): RouteHandler<T> {
  return async (req: NextRequest, context: T): Promise<NextResponse> => {
    try {
      return await handler(req, context);
    } catch (error) {
      return handleApiError(error);
    }
  };
}
