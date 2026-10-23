import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { serializeAd } from "@/lib/serialize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request, { params }) {
  const { id } = await params;
  const { error } = await requireAdmin();
  if (error) return error;

  const { reason } = await request.json().catch(() => ({}));
  if (!reason || !reason.trim()) {
    return NextResponse.json({ message: "A rejection reason is required" }, { status: 400 });
  }

  const exists = await prisma.ad.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return NextResponse.json({ message: "Ad not found" }, { status: 404 });

  const ad = await prisma.ad.update({
    where: { id },
    data: { status: "REJECTED", rejectReason: reason.trim(), isFeatured: false },
  });
  return NextResponse.json({ ad: serializeAd(ad) });
}
