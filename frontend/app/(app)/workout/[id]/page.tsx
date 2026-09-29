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
  const startedAtLabel = new Date(session.started_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex min-h-screen w-full flex-col items-center py-6">
      <main className="flex w-full flex-col items-center gap-5">
        <WorkoutSessionEditor
          session={session}
          exercises={exercises}
          readOnly={isCompleted}
          startedAtLabel={startedAtLabel}
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
          <form action={discardWorkout.bind(null, id)} className="w-full">
            <button
              type="submit"
              className="h-10 w-full rounded-3xl bg-(--button-danger-bg) font-bold text-white transition-colors hover:bg-(--button-danger-bg-hover)"
            >
              Discard workout
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
