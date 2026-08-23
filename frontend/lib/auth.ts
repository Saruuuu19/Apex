"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";
import {
  ACCESS_COOKIE,
  ACCESS_COOKIE_OPTIONS,
  REFRESH_COOKIE,
  REFRESH_COOKIE_OPTIONS,
} from "@/lib/session";

export async function login(username: string, password: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ username, password }),
    });

    const data = await res.json();

    if (res.ok) {
      const { access_token, refresh_token } = data;
      const jar = await cookies();
      jar.set(ACCESS_COOKIE, access_token, ACCESS_COOKIE_OPTIONS);
      jar.set(REFRESH_COOKIE, refresh_token, REFRESH_COOKIE_OPTIONS);
      return redirect("/routines");
    }
    return { error: data.detail };
  } catch {
    return { error: "No se pudo conectar" };
  }
}

export async function register(
  username: string,
  email: string,
  password: string,
) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await res.json();

    if (res.ok) {
      return redirect("/login");
    }

    return { error: data.detail };
  } catch {
    return { error: "No se pudo conectar" };
  }
}

export async function logout() {
  const jar = await cookies();
  const refreshToken = jar.get(REFRESH_COOKIE)?.value;

  if (refreshToken) {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    } catch {
      // Backend unreachable: still clear the local session.
    }
  }

  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
  return redirect("/login");
}