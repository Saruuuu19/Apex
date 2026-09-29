"use client";

import { useState } from "react";

import { CompleteWorkoutSheet } from "@/components/features/workout-sessions/CompleteWorkoutSheet";
import { ActiveWorkout } from "@/components/features/workout-sessions/ActiveWorkout";
import type { Exercise, WorkoutSession } from "@/types";

export function WorkoutSessionEditor({
  session,
  exercises,
  readOnly,
}: {
  session: WorkoutSession;
  exercises: Exercise[];
  readOnly: boolean;
}) {
  const [mutationsPending, setMutationsPending] = useState(false);

  return (
    <>
      <section className="flex w-full flex-col items-start gap-3">
        <ActiveWorkout
          session={session}
          exercises={exercises}
          readOnly={readOnly}
          onPendingChange={setMutationsPending}
        />
      </section>

      {readOnly ? null : (
        <CompleteWorkoutSheet
          session={session}
          disabled={mutationsPending}
        />
      )}
    </>
  );
}
