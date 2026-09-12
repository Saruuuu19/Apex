"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus } from "lucide-react";

import { ExerciseCard } from "@/components/features/exercises/ExerciseCard";
import { ExerciseSheet } from "@/components/features/exercises/ExerciseSheet";
import {
  SetTable,
  type SetTableRow,
} from "@/components/features/exercises/SetTable";
import type { RoutineSetPatch } from "@/lib/api";
import {
  addExercisesToRoutine,
  addRoutineSet,
  removeRoutineExercise,
  removeRoutineSet,
  updateRoutineSet,
} from "@/lib/actions/workout";
import type { Exercise, Routine } from "@/types";

export function RoutineExercises({
  routine,
  exercises,
}: {
  routine: Routine;
  exercises: Exercise[];
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const exerciseById = useMemo(
    () => new Map(exercises.map((exercise) => [exercise.id, exercise])),
    [exercises],
  );

  function run(action: () => Promise<void>) {
    setError(null);
    startTransition(async () => {
      try {
        await action();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  const nextOrder =
    routine.routine_exercises.reduce(
      (max, routineExercise) => Math.max(max, routineExercise.order),
      -1,
    ) + 1;

  return (
    <div className="flex w-full flex-col gap-3">
      {error ? (
        <p className="font-mono text-sm text-(--text-danger)">{error}</p>
      ) : null}

      {routine.routine_exercises.length === 0 ? (
        <p className="py-4 text-center text-sm text-(--text-muted)">
          No exercises yet. Add your first exercise.
        </p>
      ) : (
        <ul className="flex w-full flex-col gap-3">
          {routine.routine_exercises.map((routineExercise) => {
            const exercise = exerciseById.get(routineExercise.exercise_id);
            const sets: SetTableRow[] = routineExercise.routine_sets.map(
              (set) => ({
                id: set.id,
                order: set.order,
                set_type: set.set_type,
                weight: set.target_weight,
                reps: set.target_reps,
                rpe: null,
                completed: false,
              }),
            );
            return (
              <ExerciseCard
                key={routineExercise.id}
                exercise={exercise}
                disabled={isPending}
                onRemove={() =>
                  run(() =>
                    removeRoutineExercise(routine.id, routineExercise.id),
                  )
                }
              >
                <SetTable
                  sets={sets}
                  busy={isPending}
                  onUpdate={(setId, patch) => {
                    const translated: RoutineSetPatch = {};
                    if (patch.set_type !== undefined)
                      translated.set_type = patch.set_type;
                    if (patch.weight !== undefined)
                      translated.target_weight = patch.weight;
                    if (patch.reps !== undefined)
                      translated.target_reps = patch.reps;
                    run(() =>
                      updateRoutineSet(
                        routine.id,
                        routineExercise.id,
                        setId,
                        translated,
                      ),
                    );
                  }}
                  onRemove={(setId) =>
                    run(() =>
                      removeRoutineSet(routine.id, routineExercise.id, setId),
                    )
                  }
                />

                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    run(() =>
                      addRoutineSet(
                        routine.id,
                        routineExercise.id,
                        routineExercise.routine_sets.reduce(
                          (max, set) => Math.max(max, set.order),
                          -1,
                        ) + 1,
                      ),
                    )
                  }
                  className="flex h-8 items-center justify-center gap-1 rounded-md border border-(--bg-input) text-xs font-mono text-(--text-secondary) hover:bg-(--bg-input) disabled:opacity-60"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add set
                </button>
              </ExerciseCard>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        disabled={isPending}
        className="h-10 w-full rounded-md border border-(--bg-surface) bg-(--bg-surface) font-bold transition-colors hover:bg-(--bg-surface-hover) disabled:opacity-60"
      >
        Add exercise
      </button>

      <ExerciseSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        exercises={exercises}
        onConfirm={(ids) =>
          run(() => addExercisesToRoutine(routine.id, ids, nextOrder))
        }
      />
    </div>
  );
}
