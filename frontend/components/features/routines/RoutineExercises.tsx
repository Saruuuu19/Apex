"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";

import { ExerciseSheet } from "@/components/features/exercises/ExerciseSheet";
import { MUSCLE_GROUP_LABELS, SET_TYPE_LABELS } from "@/data/exercises";
import {
  addExercisesToRoutine,
  addRoutineSet,
  removeRoutineExercise,
  removeRoutineSet,
  updateRoutineSet,
} from "@/lib/actions/workout";
import { parseNumberOrNull } from "@/lib/utils";
import type { Exercise, Routine, RoutineSet, SetType } from "@/types";

function RoutineSetRow({
  set,
  onUpdate,
  onRemove,
}: {
  set: RoutineSet;
  onUpdate: (patch: {
    set_type?: SetType;
    target_reps?: number | null;
    target_weight?: number | null;
  }) => void;
  onRemove: () => void;
}) {
  const [reps, setReps] = useState(set.target_reps?.toString() ?? "");
  const [weight, setWeight] = useState(set.target_weight?.toString() ?? "");

  return (
    <div className="flex items-center gap-2">
      <span className="w-5 shrink-0 text-center font-mono text-xs text-(--text-muted)">
        {set.order + 1}
      </span>
      <select
        value={set.set_type}
        onChange={(event) => onUpdate({ set_type: event.target.value as SetType })}
        className="h-8 flex-1 rounded-md border border-(--bg-input) bg-(--bg-input) px-2 font-mono text-xs text-(--text)"
      >
        {Object.entries(SET_TYPE_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <input
        inputMode="numeric"
        placeholder="reps"
        value={reps}
        onChange={(event) => setReps(event.target.value)}
        onBlur={() => onUpdate({ target_reps: parseNumberOrNull(reps) })}
        className="h-8 w-16 rounded-md border border-(--bg-input) bg-(--bg-input) px-2 text-center font-mono text-xs text-(--text) placeholder:text-(--text-muted)"
      />
      <input
        inputMode="decimal"
        placeholder="kg"
        value={weight}
        onChange={(event) => setWeight(event.target.value)}
        onBlur={() => onUpdate({ target_weight: parseNumberOrNull(weight) })}
        className="h-8 w-16 rounded-md border border-(--bg-input) bg-(--bg-input) px-2 text-center font-mono text-xs text-(--text) placeholder:text-(--text-muted)"
      />
      <button
        type="button"
        aria-label="Remove set"
        onClick={onRemove}
        className="p-1 text-(--text-muted) hover:text-(--text-danger)"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

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

  const nextOrder = routine.routine_exercises.length;

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
            return (
              <li
                key={routineExercise.id}
                className="rounded-lg border-2 border-(--bg-input) px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-pixel text-sm font-semibold">
                      {exercise?.name ?? "Unknown exercise"}
                    </span>
                    {exercise ? (
                      <span className="text-xs text-(--text-muted)">
                        {MUSCLE_GROUP_LABELS[exercise.primary_muscle]}
                      </span>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    aria-label="Remove exercise"
                    onClick={() =>
                      run(() =>
                        removeRoutineExercise(routine.id, routineExercise.id),
                      )
                    }
                    className="p-1 text-(--text-muted) hover:text-(--text-danger)"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3 flex flex-col gap-2">
                  {routineExercise.routine_sets.length === 0 ? (
                    <p className="text-xs text-(--text-muted)">No sets</p>
                  ) : (
                    routineExercise.routine_sets
                      .slice()
                      .sort((a, b) => a.order - b.order)
                      .map((set) => (
                        <RoutineSetRow
                          key={set.id}
                          set={set}
                          onUpdate={(patch) =>
                            run(() =>
                              updateRoutineSet(
                                routine.id,
                                routineExercise.id,
                                set.id,
                                patch,
                              ),
                            )
                          }
                          onRemove={() =>
                            run(() =>
                              removeRoutineSet(
                                routine.id,
                                routineExercise.id,
                                set.id,
                              ),
                            )
                          }
                        />
                      )))}
                  <button
                    type="button"
                    onClick={() =>
                      run(() =>
                        addRoutineSet(
                          routine.id,
                          routineExercise.id,
                          routineExercise.routine_sets.length,
                        ),
                      )
                    }
                    className="flex h-8 items-center justify-center gap-1 rounded-md border border-(--bg-input) text-xs font-mono text-(--text-secondary) hover:bg-(--bg-input)"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add set
                  </button>
                </div>
              </li>
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
