"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  api,
  type RoutineSetPatch,
  type WorkoutSetPatch,
} from "@/lib/api";
import { workoutCompletionError } from "@/lib/utils";

export type RoutineFormState = { error?: string } | null;

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong";
}

// ── One-shot triggers (usable directly as <form action>) ────────────────

export async function createEmptyWorkout(): Promise<void> {
  const session = await api.createEmptyWorkout();
  redirect(`/workout/${session.id}`);
}

export async function startWorkoutFromRoutine(routineId: string): Promise<void> {
  const session = await api.startWorkoutFromRoutine(routineId);
  redirect(`/workout/${session.id}`);
}

export async function deleteRoutine(routineId: string): Promise<void> {
  await api.deleteRoutine(routineId);
  revalidatePath("/workout");
  redirect("/workout");
}

// ── Forms (useActionState) ───────────────────────────────────────────────

export async function createRoutine(
  _prev: RoutineFormState,
  formData: FormData,
): Promise<RoutineFormState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { error: "Name is required" };
  }

  try {
    const routine = await api.createRoutine(name);
    redirect(`/workout/routines/${routine.id}`);
  } catch (err) {
    return { error: errorMessage(err) };
  }
}

export async function renameRoutine(
  routineId: string,
  _prev: RoutineFormState,
  formData: FormData,
): Promise<RoutineFormState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { error: "Name is required" };
  }

  try {
    await api.updateRoutine(routineId, name);
    revalidatePath(`/workout/routines/${routineId}`);
    return null;
  } catch (err) {
    return { error: errorMessage(err) };
  }
}

// ── Routine mutations ────────────────────────────────────────────────────

export async function addExercisesToRoutine(
  routineId: string,
  exerciseIds: string[],
  startOrder: number,
): Promise<void> {
  for (let i = 0; i < exerciseIds.length; i += 1) {
    await api.addRoutineExercise(routineId, {
      exercise_id: exerciseIds[i],
      order: startOrder + i,
      routine_sets: [
        {
          order: 0,
          target_reps: null,
          target_weight: null,
          set_type: "NORMAL",
        },
      ],
    });
  }
  revalidatePath(`/workout/routines/${routineId}`);
}

export async function removeRoutineExercise(
  routineId: string,
  exerciseId: string,
): Promise<void> {
  await api.removeRoutineExercise(routineId, exerciseId);
  revalidatePath(`/workout/routines/${routineId}`);
}

export async function addRoutineSet(
  routineId: string,
  exerciseId: string,
  order: number,
): Promise<void> {
  await api.addRoutineSet(exerciseId, {
    order,
    target_reps: null,
    target_weight: null,
    set_type: "NORMAL",
  });
  revalidatePath(`/workout/routines/${routineId}`);
}

export async function updateRoutineSet(
  routineId: string,
  exerciseId: string,
  setId: string,
  patch: RoutineSetPatch,
): Promise<void> {
  await api.updateRoutineSet(exerciseId, setId, patch);
  revalidatePath(`/workout/routines/${routineId}`);
}

export async function removeRoutineSet(
  routineId: string,
  exerciseId: string,
  setId: string,
): Promise<void> {
  await api.removeRoutineSet(exerciseId, setId);
  revalidatePath(`/workout/routines/${routineId}`);
}

// ── Workout session mutations ────────────────────────────────────────────

export async function addExercisesToWorkout(
  sessionId: string,
  exerciseIds: string[],
  startOrder: number,
): Promise<void> {
  for (let i = 0; i < exerciseIds.length; i += 1) {
    await api.addWorkoutExercise(sessionId, {
      exercise_id: exerciseIds[i],
      order: startOrder + i,
      sets: [
        {
          order: 0,
          set_type: "NORMAL",
          reps: null,
          weight: null,
          rpe: null,
        },
      ],
    });
  }
  revalidatePath(`/workout/${sessionId}`);
}

export async function removeWorkoutExercise(
  sessionId: string,
  exerciseId: string,
): Promise<void> {
  await api.removeWorkoutExercise(exerciseId);
  revalidatePath(`/workout/${sessionId}`);
}

export async function addWorkoutSet(
  sessionId: string,
  exerciseId: string,
  order: number,
): Promise<void> {
  await api.addSet(exerciseId, {
    order,
    set_type: "NORMAL",
    reps: null,
    weight: null,
    rpe: null,
  });
  revalidatePath(`/workout/${sessionId}`);
}

export async function updateWorkoutSet(
  sessionId: string,
  setId: string,
  patch: WorkoutSetPatch,
): Promise<void> {
  await api.updateSet(setId, patch);
  revalidatePath(`/workout/${sessionId}`);
}

export async function removeWorkoutSet(
  sessionId: string,
  setId: string,
): Promise<void> {
  await api.removeSet(setId);
  revalidatePath(`/workout/${sessionId}`);
}

export async function completeWorkout(
  sessionId: string,
  _prev: RoutineFormState,
  formData: FormData,
): Promise<RoutineFormState> {
  const session = await api.getWorkoutSession(sessionId);
  const validationError = workoutCompletionError(session);
  if (validationError) {
    return { error: validationError };
  }

  const title = String(formData.get("title") ?? "").trim();
  const caption = String(formData.get("caption") ?? "").trim();
  const image = formData.get("image");

  try {
    let imageUrl: string | null = null;
    if (image instanceof File && image.size > 0) {
      const uploaded = await api.uploadPostImage(image);
      imageUrl = uploaded.image_url;
    }

    await api.completeWorkout(sessionId, {
      title: title || null,
      caption: caption || null,
      image_url: imageUrl,
    });
  } catch (err) {
    return { error: errorMessage(err) };
  }

  revalidatePath("/workout");
  revalidatePath("/home/feed");
  redirect("/home/feed");
}

export async function discardWorkout(sessionId: string): Promise<void> {
  await api.deleteWorkoutSession(sessionId);
  revalidatePath("/workout");
  redirect("/workout");
}
