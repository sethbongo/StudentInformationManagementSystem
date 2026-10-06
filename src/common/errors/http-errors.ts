import { AppError, ErrorDetail } from "./app-error";

export class BadRequestError extends AppError {
  constructor(message = "Bad request", details?: ErrorDetail[]) {
    super(message, 400, "BAD_REQUEST", details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized access", details?: ErrorDetail[]) {
    super(message, 401, "UNAUTHORIZED", details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action", details?: ErrorDetail[]) {
    super(message, 403, "FORBIDDEN", details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Requested resource not found", details?: ErrorDetail[]) {
    super(message, 404, "NOT_FOUND", details);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource conflict occurred", details?: ErrorDetail[]) {
    super(message, 409, "CONFLICT", details);
  }
}

export class UnprocessableEntityError extends AppError {
  constructor(message = "Unprocessable entity", details?: ErrorDetail[]) {
    super(message, 422, "UNPROCESSABLE_ENTITY", details);
  }
}

export class InternalServerError extends AppError {
  constructor(message = "Internal server error", details?: ErrorDetail[]) {
    super(message, 500, "INTERNAL_SERVER_ERROR", details);
  }
}
