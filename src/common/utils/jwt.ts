import jwt from "jsonwebtoken";
import { env } from "../env/env.schema";
import { UnauthorizedError } from "../errors/http-errors";

export interface JwtUserPayload {
  sub: string;
  email: string;
  role: "ADMINISTRATOR" | "REGISTRAR" | "INSTRUCTOR" | "STUDENT";
  studentId?: string | null;
  instructorId?: string | null;
  firstName: string;
  lastName: string;
}

export function generateToken(payload: JwtUserPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

export function verifyToken(token: string): JwtUserPayload {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JwtUserPayload;
  } catch {
    throw new UnauthorizedError("Invalid or expired authentication token");
  }
}
