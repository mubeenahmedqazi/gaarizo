import os from "os";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  let db = "connected";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    db = "disconnected";
  }
  return NextResponse.json(
    { status: "200", db, hostname: os.hostname(), time: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } }
  );
}
