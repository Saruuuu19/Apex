"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus } from "lucide-react";

import { ExerciseCard } from "@/components/features/exercises/ExerciseCard";
import { ExerciseSheet } from "@/components/features/exercises/ExerciseSheet";
import { SetTable } from "@/components/features/exercises/SetTable";
import {
  addExercisesToWorkout,
  addWorkoutSet,
  removeWorkoutExercise,
  removeWorkoutSet,
  updateWorkoutSet,
} from "@/lib/actions/workout";
import type { Exercise, WorkoutSession } from "@/types";

export function ActiveWorkout({
  session,
  exercises,
  readOnly = false,
}: {
  session: WorkoutSession;
  exercises: Exercise[];
  readOnly?: boolean;
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
    session.workout_exercises.reduce(
      (max, workoutExercise) => Math.max(max, workoutExercise.order),
      -1,
    ) + 1;
  const disabled = readOnly || isPending;

  return (
    <div className="flex w-full flex-col gap-3">
      {error ? (
        <p className="font-mono text-sm text-(--text-danger)">{error}</p>
      ) : null}

      {session.workout_exercises.length === 0 ? (
        <p className="py-4 text-center text-sm text-(--text-muted)">
          Empty workout. Add exercises to get started.
        </p>
      ) : (
        <ul className="flex w-full flex-col gap-3">
          {session.workout_exercises.map((workoutExercise) => {
            const exercise = exerciseById.get(workoutExercise.exercise_id);
            const sets = workoutExercise.sets ?? [];
            return (
              <ExerciseCard
                key={workoutExercise.id}
                exercise={exercise}
                disabled={disabled}
                onRemove={() =>
                  run(() =>
                    removeWorkoutExercise(session.id, workoutExercise.id),
                  )
                }
              >
                <SetTable
                  sets={sets}
                  showRpe
                  checkable
                  disabled={readOnly}
                  busy={isPending}
                  onUpdate={(setId, patch) =>
                    run(() => updateWorkoutSet(session.id, setId, patch))
                  }
                  onRemove={(setId) =>
                    run(() => removeWorkoutSet(session.id, setId))
                  }
                />

                {readOnly ? null : (
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                      run(() =>
                        addWorkoutSet(
                          session.id,
                          workoutExercise.id,
                          sets.reduce(
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
                )}
              </ExerciseCard>
            );
          })}
        </ul>
      )}

      {readOnly ? null : (
        <>
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
              run(() => addExercisesToWorkout(session.id, ids, nextOrder))
            }
          />
        </>
      )}
    </div>
  );
}
