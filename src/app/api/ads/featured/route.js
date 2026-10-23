import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeAd } from "@/lib/serialize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const ads = await prisma.ad.findMany({
      where: { status: "APPROVED", isFeatured: true, isSold: false },
      orderBy: { createdAt: "desc" },
      take: 8,
    });
    return NextResponse.json({ ads: ads.map(serializeAd) });
  } catch {
    return NextResponse.json({ message: "Could not load featured ads" }, { status: 500 });
  }
}
