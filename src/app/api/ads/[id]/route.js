import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { serializeAd } from "@/lib/serialize";
import { deleteImage } from "@/lib/cloudinary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  const { id } = await params;
  const user = await getCurrentUser().catch(() => null);

  const ad = await prisma.ad
    .findUnique({ where: { id }, include: { seller: { select: { name: true, phone: true } } } })
    .catch(() => null);
  if (!ad) return NextResponse.json({ message: "Ad not found" }, { status: 404 });

  const canSeeAll = user && (user.role === "ADMIN" || user.id === ad.sellerId);
  if (ad.status !== "APPROVED" && !canSeeAll) {
    return NextResponse.json({ message: "Ad not found" }, { status: 404 });
  }

  // Only count views on public (approved) ads.
  if (ad.status === "APPROVED") {
    await prisma.ad.update({ where: { id }, data: { views: { increment: 1 } } });
    ad.views += 1;
  }
  return NextResponse.json({ ad: serializeAd(ad) });
}

export async function DELETE(_request, { params }) {
  const { id } = await params;
  const { user, error } = await requireUser();
  if (error) return error;

  const ad = await prisma.ad.findUnique({ where: { id } });
  if (!ad) return NextResponse.json({ message: "Ad not found" }, { status: 404 });
  if (ad.sellerId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ message: "You cannot delete this ad" }, { status: 403 });
  }

  const images = Array.isArray(ad.images) ? ad.images : [];
  await Promise.all(images.map((img) => deleteImage(img.publicId)));
  await prisma.ad.delete({ where: { id } });
  return NextResponse.json({ message: "Ad deleted" });
}
