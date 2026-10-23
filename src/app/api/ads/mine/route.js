import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { serializeAd } from "@/lib/serialize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { user, error } = await requireUser();
  if (error) return error;
  const ads = await prisma.ad.findMany({ where: { sellerId: user.id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ ads: ads.map(serializeAd) });
}
