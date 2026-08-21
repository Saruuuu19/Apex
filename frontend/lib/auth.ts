"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";

export async function login(username: string, password: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ username, password }),
    });

    const data = await res.json();

    if (res.ok) {
      const { access_token } = data;
      (await cookies()).set("apex_token", access_token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 60, // 30 minutes (consistent with backend)
        secure: process.env.NODE_ENV === "production",
      });
      return redirect("/routines");
    }
    return { error: data.detail };
  } catch (error) {
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
  } catch (error) {
    return { error: "No se pudo conectar" };
  }
}

export async function logout() {
  (await cookies()).delete("apex_token");
  return redirect("/login");
}
