import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const where = { status: "APPROVED" };
    const [brands, cities] = await Promise.all([
      prisma.ad.findMany({ where, distinct: ["brand"], select: { brand: true }, orderBy: { brand: "asc" } }),
      prisma.ad.findMany({ where, distinct: ["city"], select: { city: true }, orderBy: { city: "asc" } }),
    ]);
    return NextResponse.json({
      brands: brands.map((b) => b.brand),
      cities: cities.map((c) => c.city),
    });
  } catch {
    return NextResponse.json({ message: "Could not load filters" }, { status: 500 });
  }
}
