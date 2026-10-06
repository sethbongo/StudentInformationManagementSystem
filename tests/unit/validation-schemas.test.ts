import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema } from "@/modules/auth/auth.schema";
import { createCourseSchema } from "@/modules/courses/course.schema";
import { createTermSchema } from "@/modules/terms/term.schema";
import { submitGradeSchema } from "@/modules/grades/grade.schema";

describe("Zod Validation Schemas", () => {
  describe("Auth Schemas", () => {
    it("should accept valid login input", () => {
      const valid = { email: "student@sims.edu", password: "Password123!" };
      const parsed = loginSchema.parse(valid);
      expect(parsed.email).toBe("student@sims.edu");
    });

    it("should reject invalid email format", () => {
      const invalid = { email: "not-an-email", password: "Password123!" };
      expect(() => loginSchema.parse(invalid)).toThrow();
    });

    it("should reject short password in register", () => {
      const invalid = {
        email: "student@sims.edu",
        password: "123",
        firstName: "John",
        lastName: "Doe",
      };
      expect(() => registerSchema.parse(invalid)).toThrow();
    });
  });

  describe("Course Schemas", () => {
    it("should accept valid course creation data", () => {
      const valid = {
        code: "CS101",
        title: "Introduction to Computer Science",
        units: 3,
      };
      const parsed = createCourseSchema.parse(valid);
      expect(parsed.units).toBe(3);
    });

    it("should reject courses with 0 or negative units", () => {
      const invalid = {
        code: "CS101",
        title: "Introduction to Computer Science",
        units: 0,
      };
      expect(() => createCourseSchema.parse(invalid)).toThrow();
    });
  });

  describe("Academic Term Schemas", () => {
    it("should accept valid term with end date after start date", () => {
      const valid = {
        code: "AY2026-2027-1S",
        name: "1st Semester AY 2026-2027",
        startDate: "2026-08-01",
        endDate: "2026-12-15",
      };
      const parsed = createTermSchema.parse(valid);
      expect(parsed.isEnrollmentOpen).toBe(false);
    });

    it("should reject term where endDate is before startDate", () => {
      const invalid = {
        code: "AY2026-2027-1S",
        name: "1st Semester AY 2026-2027",
        startDate: "2026-12-15",
        endDate: "2026-08-01",
      };
      expect(() => createTermSchema.parse(invalid)).toThrow();
    });
  });

  describe("Grade Schemas", () => {
    it("should accept numeric grade within 1.00 to 5.00 range", () => {
      const valid = {
        enrollmentId: "123e4567-e89b-12d3-a456-426614174000",
        numericGrade: 1.25,
        remarks: "PASSED",
      };
      const parsed = submitGradeSchema.parse(valid);
      expect(parsed.numericGrade).toBe(1.25);
    });

    it("should reject numeric grade outside the 1.00-5.00 range", () => {
      const invalid = {
        enrollmentId: "123e4567-e89b-12d3-a456-426614174000",
        numericGrade: 6.0,
      };
      expect(() => submitGradeSchema.parse(invalid)).toThrow();
    });
  });
});
