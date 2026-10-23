import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { serializeAd } from "@/lib/serialize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(_request, { params }) {
  const { id } = await params;
  const { error } = await requireAdmin();
  if (error) return error;

  const exists = await prisma.ad.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return NextResponse.json({ message: "Ad not found" }, { status: 404 });

  const ad = await prisma.ad.update({ where: { id }, data: { status: "APPROVED", rejectReason: null } });
  return NextResponse.json({ ad: serializeAd(ad) });
}
