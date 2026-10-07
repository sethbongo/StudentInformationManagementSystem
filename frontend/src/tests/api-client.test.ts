import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { apiClient, ApiError } from "../services/api-client";

describe("Frontend API Client & Error Normalization", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("should have configurable base URL matching environment", () => {
    const baseUrl = apiClient.getBaseUrl();
    expect(baseUrl).toContain("/api/v1");
  });

  it("should normalize 422 validation errors into field errors map", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      statusText: "Unprocessable Content",
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({
        success: false,
        message: "Validation failed.",
        errors: {
          email: ["A valid email address is required."],
          studentNumber: ["Student number is already in use."],
        },
      }),
    });

    try {
      await apiClient.post("/students", { email: "invalid" });
      expect.fail("Should have thrown ApiError");
    } catch (err: any) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.statusCode).toBe(422);
      expect(err.fieldErrors?.email).toContain("A valid email address is required.");
      expect(err.fieldErrors?.studentNumber).toContain("Student number is already in use.");
    }
  });

  it("should normalize 409 Conflict errors with appropriate message", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      statusText: "Conflict",
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({
        success: false,
        message: "Student is already enrolled in this course offering.",
        error: { code: "CONFLICT", message: "Duplicate enrollment detected" },
      }),
    });

    try {
      await apiClient.post("/enrollments", { studentId: "s1", courseOfferingId: "o1" });
      expect.fail("Should have thrown ApiError");
    } catch (err: any) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.statusCode).toBe(409);
      expect(err.message).toBe("Student is already enrolled in this course offering.");
    }
  });

  it("should normalize 403 Forbidden access denial", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      statusText: "Forbidden",
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({
        success: false,
        message: "You are not authorized to view another student's academic record.",
        error: { code: "FORBIDDEN" },
      }),
    });

    try {
      await apiClient.get("/students/another-id/academic-record");
      expect.fail("Should have thrown ApiError");
    } catch (err: any) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.statusCode).toBe(403);
      expect(err.message).toContain("not authorized");
    }
  });

  it("should handle network connection failure without crashing", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));

    try {
      await apiClient.get("/students");
      expect.fail("Should have thrown ApiError");
    } catch (err: any) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.isNetworkError).toBe(true);
      expect(err.message).toContain("Cannot connect to API server");
    }
  });
});
