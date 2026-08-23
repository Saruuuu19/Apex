export const ACCESS_COOKIE = "apex_token";
export const REFRESH_COOKIE = "apex_refresh";

export const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 30 * 60,
  secure: process.env.NODE_ENV === "production",
};

export const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 30 * 24 * 60 * 60,
  secure: process.env.NODE_ENV === "production",
};