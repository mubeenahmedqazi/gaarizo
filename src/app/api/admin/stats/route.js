import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const [totalAds, pending, approved, rejected, sold, users] = await Promise.all([
    prisma.ad.count(),
    prisma.ad.count({ where: { status: "PENDING" } }),
    prisma.ad.count({ where: { status: "APPROVED" } }),
    prisma.ad.count({ where: { status: "REJECTED" } }),
    prisma.ad.count({ where: { isSold: true } }),
    prisma.user.count(),
  ]);
  return NextResponse.json({ totalAds, pending, approved, rejected, sold, users });
}
