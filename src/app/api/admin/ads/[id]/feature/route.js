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

  const ad = await prisma.ad.findUnique({ where: { id } });
  if (!ad) return NextResponse.json({ message: "Ad not found" }, { status: 404 });
  if (ad.status !== "APPROVED") {
    return NextResponse.json({ message: "Only approved ads can be featured" }, { status: 400 });
  }

  const updated = await prisma.ad.update({ where: { id }, data: { isFeatured: !ad.isFeatured } });
  return NextResponse.json({ ad: serializeAd(updated) });
}
