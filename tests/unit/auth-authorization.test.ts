import { describe, it, expect } from "vitest";
import { requireRole } from "@/common/middleware/role-guard";
import { getAuthUser } from "@/common/middleware/auth-guard";
import { generateToken, verifyToken, JwtUserPayload } from "@/common/utils/jwt";
import { ForbiddenError, UnauthorizedError } from "@/common/errors/http-errors";
import { NextRequest } from "next/server";

describe("Authentication & Role-Based Authorization", () => {
  const adminPayload: JwtUserPayload = {
    sub: "admin-uuid-1",
    email: "admin@sims.edu",
    role: "ADMINISTRATOR",
    studentId: null,
    instructorId: null,
    firstName: "Super",
    lastName: "Admin",
  };

  const studentPayload: JwtUserPayload = {
    sub: "student-user-uuid-1",
    email: "student.alice@sims.edu",
    role: "STUDENT",
    studentId: "student-uuid-1",
    instructorId: null,
    firstName: "Alice",
    lastName: "Guo",
  };

  const instructorPayload: JwtUserPayload = {
    sub: "instructor-user-uuid-1",
    email: "prof.smith@sims.edu",
    role: "INSTRUCTOR",
    studentId: null,
    instructorId: "instructor-uuid-1",
    firstName: "Alan",
    lastName: "Smith",
  };

  describe("Role Guard Enforcement", () => {
    it("should allow Administrator to access Admin-only resources", () => {
      expect(() => requireRole(adminPayload, ["ADMINISTRATOR"])).not.toThrow();
    });

    it("should allow Registrar & Admin to access Staff resources", () => {
      expect(() => requireRole(adminPayload, ["ADMINISTRATOR", "REGISTRAR"])).not.toThrow();
    });

    it("should reject Student attempting to access Staff-only resources with ForbiddenError", () => {
      expect(() => requireRole(studentPayload, ["ADMINISTRATOR", "REGISTRAR"])).toThrow(ForbiddenError);
    });

    it("should reject Instructor attempting to delete students with ForbiddenError", () => {
      expect(() => requireRole(instructorPayload, ["ADMINISTRATOR", "REGISTRAR"])).toThrow(ForbiddenError);
    });
  });

  describe("JWT Authentication & Token Validation", () => {
    it("should sign and verify valid JWT tokens correctly", () => {
      const token = generateToken(adminPayload);
      const decoded = verifyToken(token);
      expect(decoded.sub).toBe(adminPayload.sub);
      expect(decoded.role).toBe("ADMINISTRATOR");
      expect(decoded.email).toBe("admin@sims.edu");
    });

    it("should reject invalid or tampered JWT token", () => {
      expect(() => verifyToken("invalid.tampered.token")).toThrow(UnauthorizedError);
    });

    it("should reject request with missing Bearer header in getAuthUser", () => {
      const req = new NextRequest("http://localhost:3000/api/v1/auth/me");
      expect(() => getAuthUser(req)).toThrow(UnauthorizedError);
    });

    it("should reject request with malformed Authorization header in getAuthUser", () => {
      const req = new NextRequest("http://localhost:3000/api/v1/auth/me", {
        headers: { authorization: "Basic 12345" },
      });
      expect(() => getAuthUser(req)).toThrow(UnauthorizedError);
    });

    it("should accept valid Bearer Authorization header in getAuthUser", () => {
      const token = generateToken(studentPayload);
      const req = new NextRequest("http://localhost:3000/api/v1/auth/me", {
        headers: { authorization: `Bearer ${token}` },
      });
      const user = getAuthUser(req);
      expect(user.studentId).toBe("student-uuid-1");
      expect(user.role).toBe("STUDENT");
    });
  });
});
