import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL("/api/v1/docs/ui", req.url);
  return NextResponse.redirect(url);
}
