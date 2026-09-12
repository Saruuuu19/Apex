"use client";

import { discardWorkout } from "@/lib/actions/workout";

export function DeleteWorkoutButton({ sessionId }: { sessionId: string }) {
  return (
    <form
      action={discardWorkout.bind(null, sessionId)}
      className="w-full"
      onSubmit={(event) => {
        const confirmed = window.confirm(
          "Delete this workout and its post? This cannot be undone.",
        );
        if (!confirmed) event.preventDefault();
      }}
    >
      <button
        type="submit"
        className="h-10 w-full rounded-md bg-(--button-danger-bg) font-bold text-white transition-colors hover:bg-(--button-danger-bg-hover)"
      >
        Delete workout
      </button>
    </form>
  );
}
