import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const COOKIE_NAME = "gaarizo_token";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function secret() {
  return new TextEncoder().encode(process.env.JWT_SECRET || "dev_secret_change_me");
}

export async function signToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload;
  } catch {
    return null;
  }
}

export function setAuthCookie(response, token) {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.COOKIE_SECURE === "true",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export function clearAuthCookie(response) {
  response.cookies.set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
}

// Reads the cookie, verifies the JWT and loads the user (without password).
export async function getCurrentUser() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload?.sub) return null;
  return prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, name: true, email: true, phone: true, role: true },
  });
}

// requireUser / requireAdmin return { user } on success or { error: NextResponse }.
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    return { error: NextResponse.json({ message: "Please log in first" }, { status: 401 }) };
  }
  return { user };
}

export async function requireAdmin() {
  const result = await requireUser();
  if (result.error) return result;
  if (result.user.role !== "ADMIN") {
    return { error: NextResponse.json({ message: "Admin access required" }, { status: 403 }) };
  }
  return result;
}
