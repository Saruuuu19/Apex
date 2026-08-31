import { cookies } from "next/headers";

import type {
  Exercise,
  Routine,
  RoutineExercise,
  RoutineSet,
  Set,
  User,
  WorkoutExercise,
  WorkoutSession,
} from "@/types";

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

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export type RoutineExerciseCreateBody = {
  exercise_id: string;
  order: number;
  routine_sets?: {
    order: number;
    target_reps: number | null;
    target_weight: number | null;
    set_type: Set["set_type"];
  }[];
};

export type RoutineSetCreateBody = {
  order: number;
  target_reps: number | null;
  target_weight: number | null;
  set_type: Set["set_type"];
};

export type RoutineSetPatch = {
  order?: number;
  set_type?: Set["set_type"];
  target_reps?: number | null;
  target_weight?: number | null;
};

export type WorkoutSetCreateBody = {
  order: number;
  set_type?: Set["set_type"];
  reps?: number | null;
  weight?: number | null;
  rpe?: number | null;
};

export type WorkoutSetPatch = {
  order?: number;
  set_type?: Set["set_type"];
  reps?: number | null;
  weight?: number | null;
  rpe?: number | null;
};

export const api = {
  me: () => apiFetch<User>("/auth/me"),
  myRoutines: () => apiFetch<Routine[]>("/me/routines"),
  getExercises: () => apiFetch<Exercise[]>("/exercises"),

  // Routines
  createRoutine: (name: string) =>
    apiFetch<Routine>("/routines/", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),
  getRoutine: (id: string) => apiFetch<Routine>(`/routines/${id}`),
  updateRoutine: (id: string, name: string) =>
    apiFetch<Routine>(`/routines/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ name }),
    }),
  deleteRoutine: (id: string) =>
    apiFetch<void>(`/routines/${id}`, { method: "DELETE" }),
  addRoutineExercise: (routineId: string, body: RoutineExerciseCreateBody) =>
    apiFetch<RoutineExercise>(`/routines/${routineId}/exercises`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  removeRoutineExercise: (routineId: string, exerciseId: string) =>
    apiFetch<void>(`/routines/${routineId}/exercises/${exerciseId}`, {
      method: "DELETE",
    }),
  addRoutineSet: (routineExerciseId: string, body: RoutineSetCreateBody) =>
    apiFetch<RoutineSet>(`/routines/${routineExerciseId}/sets`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateRoutineSet: (
    exerciseId: string,
    setId: string,
    body: RoutineSetPatch,
  ) =>
    apiFetch<RoutineSet>(`/routines/${exerciseId}/sets/${setId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  removeRoutineSet: (exerciseId: string, setId: string) =>
    apiFetch<void>(`/routines/${exerciseId}/sets/${setId}`, {
      method: "DELETE",
    }),

  // Workout sessions
  createEmptyWorkout: () =>
    apiFetch<WorkoutSession>("/workout-sessions/", {
      method: "POST",
      body: JSON.stringify({ workout_exercises: [] }),
    }),
  startWorkoutFromRoutine: (routineId: string) =>
    apiFetch<WorkoutSession>(`/workout-sessions/routines/${routineId}/start`, {
      method: "POST",
    }),
  getWorkoutSession: (id: string) =>
    apiFetch<WorkoutSession>(`/workout-sessions/${id}`),
  addWorkoutExercise: (
    sessionId: string,
    body: { exercise_id: string; order: number },
  ) =>
    apiFetch<WorkoutExercise>(`/workout-sessions/${sessionId}/exercises`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  removeWorkoutExercise: (exerciseId: string) =>
    apiFetch<void>(`/workout-sessions/workout-exercises/${exerciseId}`, {
      method: "DELETE",
    }),
  addSet: (workoutExerciseId: string, body: WorkoutSetCreateBody) =>
    apiFetch<Set>(`/workout-sessions/workout-exercises/${workoutExerciseId}/sets`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateSet: (setId: string, body: WorkoutSetPatch) =>
    apiFetch<Set>(`/workout-sessions/sets/${setId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  removeSet: (setId: string) =>
    apiFetch<void>(`/workout-sessions/sets/${setId}`, { method: "DELETE" }),
  completeWorkout: (id: string) =>
    apiFetch<WorkoutSession>(`/workout-sessions/${id}/complete`, {
      method: "POST",
    }),
  deleteWorkoutSession: (id: string) =>
    apiFetch<void>(`/workout-sessions/${id}`, { method: "DELETE" }),
};
