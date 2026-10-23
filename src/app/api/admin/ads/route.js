import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { serializeAd } from "@/lib/serialize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const status = new URL(request.url).searchParams.get("status");
  const where = ["PENDING", "APPROVED", "REJECTED"].includes(status) ? { status } : {};
  const ads = await prisma.ad.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { seller: { select: { name: true, email: true, phone: true } } },
  });
  return NextResponse.json({ ads: ads.map(serializeAd) });
}
