"use client";

import { useMemo, useRef, useState, useTransition } from "react";
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
  onPendingChange,
}: {
  session: WorkoutSession;
  exercises: Exercise[];
  readOnly?: boolean;
  onPendingChange?: (pending: boolean) => void;
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const pendingMutations = useRef(0);

  const exerciseById = useMemo(
    () => new Map(exercises.map((exercise) => [exercise.id, exercise])),
    [exercises],
  );

  function run(action: () => Promise<void>) {
    setError(null);
    pendingMutations.current += 1;
    onPendingChange?.(true);
    startTransition(async () => {
      try {
        await action();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        pendingMutations.current -= 1;
        if (pendingMutations.current === 0) onPendingChange?.(false);
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
                variant="flat"
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
                  variant="flat"
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
                    className="flex h-8 w-full items-center justify-center gap-1 rounded-3xl bg-(--bg-input) text-xs font-mono text-(--text-secondary) transition-colors hover:bg-(--bg-input-hover) focus-visible:text-(--text) disabled:opacity-60"
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
            className="h-10 w-full rounded-3xl bg-(--bg-surface) font-bold transition-colors hover:bg-(--bg-surface-hover) disabled:opacity-60"
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
