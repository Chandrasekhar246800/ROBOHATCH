import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "robohatch-api",
    version: "0.1.0",
    phase: "Phase 0 - Foundation",
  });
}
