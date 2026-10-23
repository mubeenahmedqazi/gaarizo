import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken, setAuthCookie } from "@/lib/auth";
import { validateLogin } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const error = validateLogin(body);
  if (error) return NextResponse.json({ message: error }, { status: 400 });

  const found = await prisma.user.findUnique({ where: { email: body.email.trim().toLowerCase() } });
  if (!found || !(await bcrypt.compare(body.password, found.password))) {
    return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
  }

  const response = NextResponse.json({
    user: { id: found.id, name: found.name, email: found.email, phone: found.phone, role: found.role },
  });
  setAuthCookie(response, await signToken({ sub: found.id, role: found.role }));
  return response;
}
