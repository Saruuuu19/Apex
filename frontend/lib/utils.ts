import type { WorkoutSession } from "@/types";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function parseNumberOrNull(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

export function formatElapsedTime(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  if (seconds < 60) return `${seconds}s`;

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  const pad = (value: number) => String(value).padStart(2, "0");

  if (hours > 0) return `${hours}:${pad(minutes)}:${pad(rest)}`;
  return `${minutes}:${pad(rest)}`;
}

export function workoutCompletionError(
  session: WorkoutSession,
): string | null {
  if (session.workout_exercises.length === 0) {
    return "Add at least one exercise before completing the workout";
  }

  const hasValidSet = session.workout_exercises.some((workoutExercise) =>
    (workoutExercise.sets ?? []).some((set) => {
      const weight = set.weight === null ? null : Number(set.weight);
      return (
        set.completed &&
        set.reps !== null &&
        set.reps > 0 &&
        weight !== null &&
        weight >= 0
      );
    }),
  );

  if (!hasValidSet) {
    return "Your workout has missing set values";
  }

  return null;
}