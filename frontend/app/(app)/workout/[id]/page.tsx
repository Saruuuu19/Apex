import { api } from "@/lib/api";
import { getCatalogExercises } from "@/lib/exercises";
import { discardWorkout } from "@/lib/actions/workout";
import { DeleteWorkoutButton } from "@/components/features/workout-sessions/DeleteWorkoutButton";
import { WorkoutSessionEditor } from "@/components/features/workout-sessions/WorkoutSessionEditor";

export default async function WorkoutSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await api.getWorkoutSession(id);
  const exercises = getCatalogExercises();

  const isCompleted = session.completed_at != null;
  const hasExercises = session.workout_exercises.length > 0;

  return (
    <div className="flex min-h-screen w-full flex-col items-center py-6">
      <main className="flex w-full flex-col items-center gap-5">
        <header className="flex w-full flex-col">
          <h1 className="font-pixel text-3xl font-bold">Workout</h1>
          <p className="text-sm text-(--text-muted)">
            {new Date(session.started_at).toLocaleString()}
          </p>
        </header>

        <WorkoutSessionEditor
          session={session}
          exercises={exercises}
          readOnly={isCompleted}
        />

        {isCompleted ? (
          <div className="flex w-full flex-col items-center gap-3">
            <p
              className="w-full text-center font-pixel text-sm font-semibold"
              style={{ color: "var(--recovery-green)" }}
            >
              Completed
            </p>
            <DeleteWorkoutButton sessionId={id} />
          </div>
        ) : (
          <>
            {!hasExercises ? (
              <p className="w-full text-center text-xs text-(--text-muted)">
                Add at least one exercise to complete the workout.
              </p>
            ) : null}
            <form action={discardWorkout.bind(null, id)} className="w-full">
              <button
                type="submit"
                className="h-10 w-full rounded-3xl bg-(--button-danger-bg) font-bold text-white transition-colors hover:bg-(--button-danger-bg-hover)"
              >
                Discard workout
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
