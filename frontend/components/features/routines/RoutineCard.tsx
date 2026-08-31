import Link from "next/link";

import type { Routine } from "@/types";

export function RoutineCard({ routine }: { routine: Routine }) {
  const exerciseCount = routine.routine_exercises.length;
  const setCount = routine.routine_exercises.reduce(
    (acc, exercise) => acc + exercise.routine_sets.length,
    0,
  );

  return (
    <Link
      href={`/workout/routines/${routine.id}`}
      className="flex w-full flex-col items-start gap-1 rounded-lg border-2 border-(--bg-input) px-5 py-4 transition-colors hover:border-(--text-link)"
    >
      <span className="font-pixel text-sm font-semibold">{routine.name}</span>
      <span className="text-xs text-(--text-muted)">
        {exerciseCount} exercises · {setCount} sets
      </span>
    </Link>
  );
}
