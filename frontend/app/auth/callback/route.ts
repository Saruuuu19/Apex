import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { API_BASE_URL } from "@/lib/api";
import {
  ACCESS_COOKIE,
  ACCESS_COOKIE_OPTIONS,
  REFRESH_COOKIE,
  REFRESH_COOKIE_OPTIONS,
} from "@/lib/session";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const res = await fetch(`${API_BASE_URL}/auth/exchange`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });

  if (!res.ok) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { access_token, refresh_token } = await res.json();

  const jar = await cookies();
  jar.set(ACCESS_COOKIE, access_token, ACCESS_COOKIE_OPTIONS);
  jar.set(REFRESH_COOKIE, refresh_token, REFRESH_COOKIE_OPTIONS);

  return NextResponse.redirect(new URL("/routines", request.url));
}