import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { serializeAd } from "@/lib/serialize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(_request, { params }) {
  const { id } = await params;
  const { user, error } = await requireUser();
  if (error) return error;

  const ad = await prisma.ad.findUnique({ where: { id } });
  if (!ad) return NextResponse.json({ message: "Ad not found" }, { status: 404 });
  if (ad.sellerId !== user.id) {
    return NextResponse.json({ message: "Only the owner can change this ad" }, { status: 403 });
  }

  const updated = await prisma.ad.update({ where: { id }, data: { isSold: !ad.isSold } });
  return NextResponse.json({ ad: serializeAd(updated) });
}
