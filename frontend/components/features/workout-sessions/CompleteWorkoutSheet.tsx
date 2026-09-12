"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { ImagePlus, X } from "lucide-react";

import { completeWorkout } from "@/lib/actions/workout";
import { workoutCompletionError } from "@/lib/utils";
import type { WorkoutSession } from "@/types";

export function CompleteWorkoutSheet({
  session,
}: {
  session: WorkoutSession;
}) {
  const sessionId = session.id;
  const [open, setOpen] = useState(false);
  const [alert, setAlert] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, formAction, pending] = useActionState(
    completeWorkout.bind(null, sessionId),
    null,
  );

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  function handleRemoveImage() {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleClose() {
    if (!pending) setOpen(false);
  }

  function handleOpen() {
    const error = workoutCompletionError(session);
    if (error) {
      setAlert(error);
      return;
    }
    setOpen(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="h-10 w-full rounded-md bg-(--button-bg) font-bold text-white transition-colors hover:bg-(--button-bg-hover)"
      >
        Complete Workout
      </button>

      {alert ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center px-6"
          role="alertdialog"
          aria-modal="true"
          aria-label="Workout incomplete"
        >
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setAlert(null)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-(--bg-input) bg-(--bg) px-5 py-6 text-center shadow-xl">
            <p className="font-mono text-sm text-(--text)">{alert}</p>
            <p className="mt-3 text-xs text-(--text-muted)">
              Tap outside to dismiss
            </p>
          </div>
        </div>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={handleClose}
            aria-hidden="true"
          />
          <form
            action={formAction}
            className="relative flex w-full flex-col gap-4 rounded-t-2xl border-t border-(--bg-input) bg-(--bg) px-5 pt-4 pb-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-pixel text-xl font-bold">Complete Workout</h2>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close"
                disabled={pending}
                className="p-1 text-(--text-muted) hover:text-(--text) disabled:opacity-40"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="title"
                className="font-mono text-sm font-medium text-(--text)"
              >
                Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                maxLength={100}
                placeholder="Monday Workout 🏋️"
                className="h-10 w-full rounded-md border border-(--bg-input) bg-(--bg-input) px-3 font-mono text-(--text) placeholder:text-(--text-muted)"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="caption"
                className="font-mono text-sm font-medium text-(--text)"
              >
                Caption
              </label>
              <textarea
                id="caption"
                name="caption"
                rows={3}
                placeholder="How did it feel?"
                className="w-full resize-none rounded-md border border-(--bg-input) bg-(--bg-input) px-3 py-2 font-mono text-(--text) placeholder:text-(--text-muted)"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-sm font-medium text-(--text)">
                Photo
              </span>
              <input
                ref={fileInputRef}
                id="image"
                name="image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="sr-only"
              />
              {preview ? (
                <div className="relative w-40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt=""
                    className="aspect-square w-40 rounded-xl object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    aria-label="Remove photo"
                    className="absolute top-1.5 right-1.5 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-dashed border-(--bg-input) font-mono text-sm text-(--text-secondary) hover:bg-(--bg-input)"
                >
                  <ImagePlus className="h-4 w-4" />
                  Add a square photo (max 5 MB)
                </button>
              )}
            </div>

            {state?.error ? (
              <p
                role="alert"
                className="font-mono text-sm text-(--text-danger)"
              >
                {state.error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={pending}
              className="h-10 w-full rounded-md bg-(--button-bg) font-bold text-white transition-colors hover:bg-(--button-bg-hover) disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Completing..." : "Complete"}
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}
