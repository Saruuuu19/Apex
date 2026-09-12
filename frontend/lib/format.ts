import type { WorkoutSession } from "@/types";

function formatTime(date: Date): string {
  return date
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .toLowerCase();
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function formatPerformedAt(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const dayDiff = Math.round(
    (startOfDay(now) - startOfDay(date)) / 86_400_000,
  );
  const time = formatTime(date);

  if (dayDiff === 0) return `Today at ${time}`;
  if (dayDiff === 1) return `Yesterday at ${time}`;

  const options: Intl.DateTimeFormatOptions =
    date.getFullYear() === now.getFullYear()
      ? { month: "short", day: "numeric" }
      : { month: "short", day: "numeric", year: "numeric" };
  return `${date.toLocaleDateString("en-US", options)} at ${time}`;
}

export function formatWeekdayWorkout(iso: string): string {
  const weekday = new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
  });
  return `${weekday} Workout 🏋️`;
}

export function formatMinutes(seconds: number | null): string {
  if (seconds === null) return "—";
  return String(Math.round(seconds / 60));
}

export function countSessionSets(session: WorkoutSession | null): number | null {
  if (!session) return null;
  return session.workout_exercises.reduce(
    (total, exercise) => total + (exercise.sets?.length ?? 0),
    0,
  );
}

export function sessionVolumeKg(session: WorkoutSession | null): number | null {
  if (!session) return null;
  let volume = 0;
  for (const exercise of session.workout_exercises) {
    for (const set of exercise.sets ?? []) {
      if (set.reps === null || set.weight === null) continue;
      volume += Number(set.reps) * Number(set.weight);
    }
  }
  return Math.round(volume);
}

export function formatVolume(volumeKg: number | null): string {
  if (volumeKg === null) return "—";
  return `${volumeKg.toLocaleString("en-US")} kg`;
}
