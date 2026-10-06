import { ForbiddenError } from "../errors/http-errors";
import { JwtUserPayload } from "../utils/jwt";

export type RoleType = "ADMINISTRATOR" | "REGISTRAR" | "INSTRUCTOR" | "STUDENT";

export function requireRole(user: JwtUserPayload, allowedRoles: RoleType[]): void {
  if (!allowedRoles.includes(user.role)) {
    throw new ForbiddenError(
      `Access forbidden. Role '${user.role}' is not authorized to access this resource.`
    );
  }
}
