import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  (await cookies()).set("apex_token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 60,
    secure: process.env.NODE_ENV === "production",
  });

  return NextResponse.redirect(new URL("/routines", request.url));
}