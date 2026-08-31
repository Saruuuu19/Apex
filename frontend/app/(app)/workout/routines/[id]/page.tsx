import { api } from "@/lib/api";
import {
  deleteRoutine,
  renameRoutine,
  startWorkoutFromRoutine,
} from "@/lib/actions/workout";
import { RoutineExercises } from "@/components/features/routines/RoutineExercises";
import { RoutineForm } from "@/components/features/routines/RoutineForm";

export default async function RoutineDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [routine, exercises] = await Promise.all([
    api.getRoutine(id),
    api.getExercises(),
  ]);

  const renameAction = renameRoutine.bind(null, id);
  const startAction = startWorkoutFromRoutine.bind(null, id);
  const deleteAction = deleteRoutine.bind(null, id);

  return (
    <div className="flex min-h-screen w-full flex-col items-center py-6">
      <main className="flex w-full flex-col items-center gap-5">
        <header className="flex w-full flex-col">
          <h1 className="font-pixel text-3xl font-bold">{routine.name}</h1>
        </header>

        <section className="flex w-full flex-col items-start gap-3">
          <h2 className="font-pixel text-2xl font-bold">Details</h2>
          <RoutineForm
            action={renameAction}
            initialName={routine.name}
            submitLabel="Save name"
            heading="Rename"
          />
        </section>

        <section className="flex w-full flex-col items-start gap-3">
          <h2 className="font-pixel text-2xl font-bold">Exercises</h2>
          <RoutineExercises routine={routine} exercises={exercises} />
        </section>

        <section className="flex w-full flex-col gap-3">
          <form action={startAction} className="w-full">
            <button
              type="submit"
              className="h-10 w-full rounded-md bg-(--button-bg) font-bold text-white transition-colors hover:bg-(--button-bg-hover)"
            >
              Start Workout
            </button>
          </form>
          <form action={deleteAction} className="w-full">
            <button
              type="submit"
              className="h-10 w-full rounded-md border border-(--text-danger) font-bold text-(--text-danger) transition-colors hover:bg-(--text-danger)/10"
            >
              Delete Routine
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
