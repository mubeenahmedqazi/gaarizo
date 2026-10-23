import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { serializeAd } from "@/lib/serialize";
import { isCloudinaryConfigured, uploadBuffer } from "@/lib/cloudinary";
import { validateAd, validateImageFile, MAX_IMAGES } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LIMIT = 12;

export async function GET(request) {
  const sp = new URL(request.url).searchParams;
  const where = { status: "APPROVED" };

  const search = sp.get("search")?.trim();
  if (search) {
    where.OR = ["title", "brand", "model"].map((f) => ({
      [f]: { contains: search, mode: "insensitive" },
    }));
  }
  if (sp.get("brand")) where.brand = { equals: sp.get("brand"), mode: "insensitive" };
  if (sp.get("city")) where.city = { equals: sp.get("city"), mode: "insensitive" };
  if (sp.get("fuel")) where.fuel = sp.get("fuel");
  if (sp.get("transmission")) where.transmission = sp.get("transmission");

  const price = {};
  if (sp.get("minPrice")) price.gte = BigInt(Math.floor(Number(sp.get("minPrice")) || 0));
  if (sp.get("maxPrice")) price.lte = BigInt(Math.floor(Number(sp.get("maxPrice")) || 0));
  if (Object.keys(price).length) where.price = price;

  const year = {};
  if (sp.get("minYear")) year.gte = Number(sp.get("minYear"));
  if (sp.get("maxYear")) year.lte = Number(sp.get("maxYear"));
  if (Object.keys(year).length) where.year = year;

  const sort = sp.get("sort");
  const orderBy =
    sort === "priceLow" ? { price: "asc" } : sort === "priceHigh" ? { price: "desc" } : { createdAt: "desc" };

  const page = Math.max(1, parseInt(sp.get("page")) || 1);

  try {
    const [total, ads] = await Promise.all([
      prisma.ad.count({ where }),
      prisma.ad.findMany({ where, orderBy, skip: (page - 1) * LIMIT, take: LIMIT }),
    ]);
    return NextResponse.json({
      ads: ads.map(serializeAd),
      total,
      page,
      pages: Math.max(1, Math.ceil(total / LIMIT)),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Could not load ads" }, { status: 500 });
  }
}

export async function POST(request) {
  const { user, error } = await requireUser();
  if (error) return error;

  let form;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ message: "Invalid form data" }, { status: 400 });
  }

  const text = (k) => String(form.get(k) ?? "").trim();
  const data = {
    title: text("title"),
    brand: text("brand"),
    model: text("model"),
    year: parseInt(text("year")),
    price: Number(text("price")),
    mileage: parseInt(text("mileage")),
    city: text("city"),
    fuel: text("fuel"),
    transmission: text("transmission"),
    engineCC: parseInt(text("engineCC")),
    color: text("color"),
    description: text("description"),
  };
  const invalid = validateAd(data);
  if (invalid) return NextResponse.json({ message: invalid }, { status: 400 });

  const files = form.getAll("images").filter((f) => typeof f === "object" && f.size > 0);
  if (files.length > MAX_IMAGES) {
    return NextResponse.json({ message: `You can upload up to ${MAX_IMAGES} images` }, { status: 400 });
  }
  for (const file of files) {
    const problem = validateImageFile(file);
    if (problem) return NextResponse.json({ message: problem }, { status: 400 });
  }
  if (files.length && !isCloudinaryConfigured()) {
    return NextResponse.json(
      { message: "Image upload is not configured on the server (missing Cloudinary keys)" },
      { status: 500 }
    );
  }

  const images = [];
  try {
    for (const file of files) {
      images.push(await uploadBuffer(Buffer.from(await file.arrayBuffer())));
    }
  } catch (e) {
    console.error("Cloudinary upload failed:", e);
    return NextResponse.json({ message: "Image upload failed. Please try again." }, { status: 500 });
  }

  const ad = await prisma.ad.create({
    data: { ...data, price: BigInt(Math.round(data.price)), images, status: "PENDING", sellerId: user.id },
  });
  return NextResponse.json({ ad: serializeAd(ad) }, { status: 201 });
}
