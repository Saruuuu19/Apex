import Link from "next/link";

import { api } from "@/lib/api";
import { createEmptyWorkout } from "@/lib/actions/workout";
import { RoutineCard } from "@/components/features/routines/RoutineCard";

export default async function WorkoutPage() {
  const routines = await api.myRoutines();

  return (
    <div className="flex min-h-screen w-full flex-col items-center py-6">
      <main className="flex w-full flex-col items-center gap-5">
        <header className="flex w-full flex-col">
          <h1 className="font-pixel text-3xl font-bold">Workout</h1>
        </header>

        <section className="flex w-full flex-col items-start gap-3">
          <h2 className="font-pixel text-2xl font-bold">Quick Start</h2>
          <form action={createEmptyWorkout} className="w-full">
            <button
              type="submit"
              className="h-10 w-full rounded-md bg-(--button-bg) font-bold text-white transition-colors hover:bg-(--button-bg-hover)"
            >
              Start New Empty Workout
            </button>
          </form>
        </section>

        <section className="flex w-full flex-col items-start gap-3">
          <h2 className="font-pixel text-2xl font-bold">Your Routines</h2>
          <Link
            href="/workout/routines/new"
            className="flex h-10 w-full items-center justify-center rounded-md border border-(--bg-surface) bg-(--bg-surface) font-bold transition-colors hover:bg-(--bg-surface-hover)"
          >
            New Routine
          </Link>
          {routines.length === 0 ? (
            <p className="w-full py-4 text-center text-sm text-(--text-muted)">
              No routines yet. Create your first routine.
            </p>
          ) : (
            <ul className="flex w-full list-none flex-col gap-3 p-0">
              {routines.map((routine) => (
                <li key={routine.id} className="w-full">
                  <RoutineCard routine={routine} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
