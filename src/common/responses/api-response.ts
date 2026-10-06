import { NextResponse } from "next/server";
import { ErrorDetail } from "../errors/app-error";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export class ApiResponse {
  static success<T>(data: T, meta?: Record<string, unknown>, status = 200) {
    const message = (meta?.message as string) || undefined;
    return NextResponse.json(
      {
        success: true,
        ...(message ? { message } : {}),
        data,
        meta: {
          timestamp: new Date().toISOString(),
          ...meta,
        },
      },
      { status }
    );
  }

  static created<T>(data: T, meta?: Record<string, unknown>) {
    return this.success(data, meta, 201);
  }

  static noContent() {
    return new NextResponse(null, { status: 204 });
  }

  static paginated<T>(data: T[], page: number, limit: number, total: number) {
    const totalPages = Math.ceil(total / limit);
    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };

    return NextResponse.json(
      {
        success: true,
        data,
        meta,
      },
      { status: 200 }
    );
  }

  static error(
    message: string,
    status = 500,
    errorCode = "INTERNAL_SERVER_ERROR",
    details?: ErrorDetail[]
  ) {
    const errorsMap = details?.reduce<Record<string, string[]>>((acc, d) => {
      const fieldKey = d.field || "general";
      acc[fieldKey] = acc[fieldKey] ? [...acc[fieldKey], d.message] : [d.message];
      return acc;
    }, {});

    return NextResponse.json(
      {
        success: false,
        message,
        error: {
          code: errorCode,
          message,
          ...(details && details.length > 0 ? { details } : {}),
        },
        ...(errorsMap && Object.keys(errorsMap).length > 0 ? { errors: errorsMap } : {}),
      },
      { status }
    );
  }
}
