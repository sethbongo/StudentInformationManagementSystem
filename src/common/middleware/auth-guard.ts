import { NextRequest } from "next/server";
import { UnauthorizedError } from "../errors/http-errors";
import { verifyToken, JwtUserPayload } from "../utils/jwt";

export function getAuthUser(req: NextRequest): JwtUserPayload {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("Authentication required. Please provide a Bearer token.");
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    throw new UnauthorizedError("Malformed authorization token.");
  }

  return verifyToken(token);
}
