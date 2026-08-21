import { cookies } from "next/headers";

import type { Exercise, Routine, User, WorkoutSession } from "@/types";

export const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string,
  ) {
    super(detail);
  }
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = (await cookies()).get("apex_token")?.value;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body && !(options.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new ApiError(res.status, body.detail ?? res.statusText);
  }

  return res.json() as Promise<T>;
}

export const api = {
  me: () => apiFetch<User>("/auth/me"),
  myRoutines: () => apiFetch<Routine[]>("/me/routines"),
  myWorkoutSessions: () => apiFetch<WorkoutSession[]>("/me/workout-sessions"),
  getExercises: () => apiFetch<Exercise[]>("/exercises"),
};