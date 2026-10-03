import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const publicRoutes = ["/", "/about", "/architecture", "/privacy-policy", "/terms"];
const authRoutes = ["/login"];
const protectedRoutes = ["/dashboard"];

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAuthenticated = !!token;
  const { pathname } = req.nextUrl;

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || (route !== "/" && pathname.startsWith(`${route}/`))
  );
  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  if (isAuthRoute && isAuthenticated) {
    let nextDestination =
      req.nextUrl.searchParams.get("next") ||
      req.nextUrl.searchParams.get("callbackUrl") ||
      "/";
    if (nextDestination.startsWith("/login")) {
      nextDestination = "/";
    }
    return NextResponse.redirect(new URL(nextDestination, req.url));
  }

  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", req.url);
    const target = `${pathname}${req.nextUrl.search}`;
    loginUrl.searchParams.set("next", target);
    loginUrl.searchParams.set("callbackUrl", target);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublicRoute) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
