import { describe, it, expect } from "vitest";
import { ApiResponse } from "@/common/responses/api-response";

describe("ApiResponse Formatter", () => {
  it("should create a formatted success response with timestamp meta", async () => {
    const data = { id: 1, name: "BSCS" };
    const response = ApiResponse.success(data);

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data).toEqual(data);
    expect(json.meta.timestamp).toBeDefined();
  });

  it("should create a correctly calculated paginated response", async () => {
    const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const response = ApiResponse.paginated(items, 1, 10, 25);

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data.length).toBe(3);
    expect(json.meta.page).toBe(1);
    expect(json.meta.limit).toBe(10);
    expect(json.meta.total).toBe(25);
    expect(json.meta.totalPages).toBe(3);
    expect(json.meta.hasNextPage).toBe(true);
    expect(json.meta.hasPreviousPage).toBe(false);
  });

  it("should create a formatted error response with details", async () => {
    const response = ApiResponse.error("Validation failed", 400, "VALIDATION_ERROR", [
      { field: "email", message: "Email is required" },
    ]);

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("VALIDATION_ERROR");
    expect(json.error.details.length).toBe(1);
  });
});
