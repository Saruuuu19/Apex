"use client";

import { useState } from "react";

import { CompleteWorkoutSheet } from "@/components/features/workout-sessions/CompleteWorkoutSheet";
import { ActiveWorkout } from "@/components/features/workout-sessions/ActiveWorkout";
import { SessionTimer } from "@/components/features/workout-sessions/SessionTimer";
import type { Exercise, WorkoutSession } from "@/types";

export function WorkoutSessionEditor({
  session,
  exercises,
  readOnly,
  startedAtLabel,
}: {
  session: WorkoutSession;
  exercises: Exercise[];
  readOnly: boolean;
  startedAtLabel: string;
}) {
  const [mutationsPending, setMutationsPending] = useState(false);

  return (
    <>
      <header className="flex w-full items-start justify-between gap-4">
        <div className="flex flex-col">
          <h1 className="font-pixel text-3xl font-bold">Workout</h1>
          <p className="text-sm text-(--text-muted)">
            {startedAtLabel}
            <SessionTimer
              startedAt={session.started_at}
              endedAt={session.completed_at}
            />
          </p>
        </div>

        {readOnly ? null : (
          <CompleteWorkoutSheet
            session={session}
            disabled={mutationsPending}
          />
        )}
      </header>

      <section className="flex w-full flex-col items-start gap-3">
        <ActiveWorkout
          session={session}
          exercises={exercises}
          readOnly={readOnly}
          onPendingChange={setMutationsPending}
        />
      </section>
    </>
  );
}
