"use client";

import { useActionState } from "react";

import type { RoutineFormState } from "@/lib/actions/workout";

export function RoutineForm({
  action,
  initialName = "",
  submitLabel,
  heading,
}: {
  action: (
    prev: RoutineFormState,
    formData: FormData,
  ) => Promise<RoutineFormState>;
  initialName?: string;
  submitLabel: string;
  heading: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      <h1 className="font-pixel text-2xl font-bold">{heading}</h1>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="name"
          className="text-sm font-medium font-mono text-(--text)"
        >
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          defaultValue={initialName}
          placeholder="Routine name"
          required
          maxLength={100}
          className="h-10 w-full rounded-md border border-(--bg-input) bg-(--bg-input) px-3 font-mono text-(--text) placeholder:text-(--text-muted)"
        />
      </div>

      {state?.error ? (
        <p role="alert" className="font-mono text-sm text-(--text-danger)">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="h-10 w-full rounded-md bg-(--button-bg) font-bold text-white transition-colors hover:bg-(--button-bg-hover) disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
