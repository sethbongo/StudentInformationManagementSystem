import { NextRequest } from "next/server";
import { ZodSchema, z } from "zod";
import { BadRequestError } from "../errors/http-errors";

export async function validateBody<T extends ZodSchema>(
  schema: T,
  req: NextRequest
): Promise<z.infer<T>> {
  try {
    const body = await req.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new BadRequestError("Invalid JSON in request body");
    }
    throw error;
  }
}

export function validateQuery<T extends ZodSchema>(
  schema: T,
  req: NextRequest
): z.infer<T> {
  const { searchParams } = new URL(req.url);
  const queryObj: Record<string, unknown> = {};

  searchParams.forEach((value, key) => {
    queryObj[key] = value;
  });

  return schema.parse(queryObj);
}

export async function validateParams<T extends ZodSchema>(
  schema: T,
  paramsPromise: Promise<Record<string, string | string[]>> | Record<string, string | string[]>
): Promise<z.infer<T>> {
  const resolvedParams = await Promise.resolve(paramsPromise);
  return schema.parse(resolvedParams);
}
