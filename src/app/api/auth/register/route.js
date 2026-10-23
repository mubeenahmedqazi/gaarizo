import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken, setAuthCookie } from "@/lib/auth";
import { validateRegister } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const error = validateRegister(body);
  if (error) return NextResponse.json({ message: error }, { status: 400 });

  const email = body.email.trim().toLowerCase();
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ message: "Email is already registered" }, { status: 409 });

  const user = await prisma.user.create({
    data: {
      name: body.name.trim(),
      email,
      phone: body.phone,
      password: await bcrypt.hash(body.password, 10),
    },
    select: { id: true, name: true, email: true, phone: true, role: true },
  });

  const response = NextResponse.json({ user }, { status: 201 });
  setAuthCookie(response, await signToken({ sub: user.id, role: user.role }));
  return response;
}
