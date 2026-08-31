import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  ACCESS_COOKIE,
  ACCESS_COOKIE_OPTIONS,
  REFRESH_COOKIE,
  REFRESH_COOKIE_OPTIONS,
} from "@/lib/session";

const PROTECTED_PREFIXES = [
  "/home/feed",
  "/home/dashboard",
  "/workout",
  "/exercises",
  "/trainer",
  "/settings",
  "/profile",
];
const AUTH_PAGES = ["/login", "/register"];

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8000";
const REFRESH_BEFORE_MS = 5 * 60 * 1000;

function getJwtExpiry(token: string): number | null {
  const payload = token.split(".")[1];
  if (!payload) return null;
  try {
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const decoded = JSON.parse(json) as { exp?: number };
    return typeof decoded.exp === "number" ? decoded.exp : null;
  } catch {
    return null;
  }
}

function needsRefresh(token: string | undefined): boolean {
  if (!token) return true;
  const exp = getJwtExpiry(token);
  if (exp === null) return true;
  return exp * 1000 <= Date.now() + REFRESH_BEFORE_MS;
}

function redirectToLogin(request: NextRequest, pathname: string) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

function clearSession(response: NextResponse) {
  response.cookies.delete(ACCESS_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
}

async function refreshAndRedirect(
  request: NextRequest,
  refreshToken: string,
  goToRoutines: boolean,
): Promise<NextResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      clearSession(response);
      return response;
    }

    const { access_token, refresh_token } = await res.json();

    const target = goToRoutines
      ? new URL("/workout", request.url)
      : request.nextUrl.clone();
    const response = NextResponse.redirect(target);
    response.cookies.set(ACCESS_COOKIE, access_token, ACCESS_COOKIE_OPTIONS);
    response.cookies.set(REFRESH_COOKIE, refresh_token, REFRESH_COOKIE_OPTIONS);
    return response;
  } catch {
    const response = NextResponse.redirect(new URL("/login", request.url));
    clearSession(response);
    return response;
  }
}

export function proxy(request: NextRequest) {
  // DEV ONLY: permite previsualizar rutas protegidas sin auth en local
  if (
    process.env.DEV_BYPASS_AUTH === "true" &&
    process.env.NODE_ENV !== "production"
  ) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
  const isAuthPage = AUTH_PAGES.includes(pathname);

  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  const accessExpiring = needsRefresh(accessToken);

  if (isAuthPage) {
    if (accessToken && !accessExpiring) {
      return NextResponse.redirect(new URL("/workout", request.url));
    }
    if (refreshToken) {
      return refreshAndRedirect(request, refreshToken, true);
    }
    return NextResponse.next();
  }

  if (isProtected) {
    if (!accessToken && !refreshToken) {
      return redirectToLogin(request, pathname);
    }
    if (accessExpiring) {
      if (!refreshToken) {
        const response = redirectToLogin(request, pathname);
        clearSession(response);
        return response;
      }
      return refreshAndRedirect(request, refreshToken, false);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/home/feed/:path*",
    "/home/dashboard/:path*",
    "/workout/:path*",
    "/exercises/:path*",
    "/trainer/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/login",
    "/register",
  ],
};
