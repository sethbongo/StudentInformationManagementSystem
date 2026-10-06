import { describe, it, expect } from "vitest";
import { generateToken, verifyToken, JwtUserPayload } from "@/common/utils/jwt";
import { UnauthorizedError } from "@/common/errors/http-errors";

describe("JWT Utility Module", () => {
  const samplePayload: JwtUserPayload = {
    sub: "user-uuid-12345",
    email: "student@sims.edu",
    role: "STUDENT",
    studentId: "student-uuid-67890",
    firstName: "Alice",
    lastName: "Guo",
  };

  it("should generate a valid JWT and successfully decode it", () => {
    const token = generateToken(samplePayload);
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(3);

    const decoded = verifyToken(token);
    expect(decoded.sub).toBe(samplePayload.sub);
    expect(decoded.email).toBe(samplePayload.email);
    expect(decoded.role).toBe("STUDENT");
    expect(decoded.studentId).toBe(samplePayload.studentId);
  });

  it("should throw UnauthorizedError on invalid token signature", () => {
    const invalidToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature";
    expect(() => verifyToken(invalidToken)).toThrow(UnauthorizedError);
  });
});
