import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard", "/feed", "/routines", "/exercises", "/trainer", "/settings", "/profile", "/workout-sessions"];
const AUTH_PAGES = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
  const isAuthPage = AUTH_PAGES.includes(pathname);

  if (isAuthPage && request.cookies.has("apex_token")) {
    return NextResponse.redirect(new URL("/routines", request.url));
  }

  if (isProtected && !request.cookies.has("apex_token")) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/feed/:path*",
    "/routines/:path*",
    "/exercises/:path*",
    "/trainer/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/workout-sessions/:path*",
    "/login",
    "/register",
  ],
};