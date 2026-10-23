import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Next.js 16 request interception (formerly middleware.js).
// Protects pages only; API handlers re-check auth on the server too.
export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("gaarizo_token")?.value;

  let payload = null;
  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev_secret_change_me");
      ({ payload } = await jwtVerify(token, secret));
    } catch {
      payload = null;
    }
  }

  if (!payload) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  if (pathname.startsWith("/admin") && payload.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/post-ad/:path*", "/my-ads/:path*", "/admin/:path*"],
};
