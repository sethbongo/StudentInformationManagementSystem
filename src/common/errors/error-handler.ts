import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { AppError } from "./app-error";
import { ApiResponse } from "../responses/api-response";

export function handleApiError(error: unknown) {
  // If it's a known domain AppError
  if (error instanceof AppError) {
    return ApiResponse.error(
      error.message,
      error.statusCode,
      error.errorCode,
      error.details
    );
  }

  // If it's a Zod schema validation error
  if (error instanceof ZodError) {
    const details = error.errors.map((err) => ({
      field: err.path.join(".") || "body",
      message: err.message,
    }));
    return ApiResponse.error(
      "Validation failed.",
      422,
      "VALIDATION_ERROR",
      details
    );
  }

  // If it's a Prisma error
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002": {
        const target = (error.meta?.target as string[]) || [];
        const fieldName = target.length > 0 ? target.join(", ") : "field";
        return ApiResponse.error(
          `Unique constraint violation: A record with this ${fieldName} already exists`,
          409,
          "CONFLICT",
          [{ field: fieldName, message: "Value must be unique" }]
        );
      }
      case "P2025":
        return ApiResponse.error(
          "The requested database record was not found",
          404,
          "NOT_FOUND"
        );
      case "P2003": {
        const field = (error.meta?.field_name as string) || "foreign_key";
        return ApiResponse.error(
          `Foreign key constraint failed on ${field}`,
          422,
          "FOREIGN_KEY_VIOLATION"
        );
      }
      default:
        console.error("Database Error:", error);
        return ApiResponse.error(
          "A database processing error occurred. Please verify your request data.",
          400,
          "DATABASE_ERROR"
        );
    }
  }

  // Standard JavaScript error
  if (error instanceof Error) {
    console.error("Unhandled Server Error:", error);
    return ApiResponse.error(
      "An unexpected internal server error occurred",
      500,
      "INTERNAL_SERVER_ERROR"
    );
  }

  // Fallback
  console.error("Unknown Exception:", error);
  return ApiResponse.error(
    "An unexpected error occurred",
    500,
    "INTERNAL_SERVER_ERROR"
  );
}
