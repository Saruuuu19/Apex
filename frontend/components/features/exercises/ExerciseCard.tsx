import type { ReactNode } from "react";
import { Trash2 } from "lucide-react";

import { MUSCLE_GROUP_LABELS } from "@/data/exercises";
import { getExerciseImageUrl } from "@/lib/exercises";
import type { Exercise } from "@/types";

export function ExerciseCard({
  exercise,
  onRemove,
  disabled = false,
  children,
}: {
  exercise: Exercise | undefined;
  onRemove: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <li className="rounded-lg border-2 border-(--bg-input) px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getExerciseImageUrl(exercise)}
            alt=""
            width={40}
            height={40}
            loading="lazy"
            className="h-10 w-10 shrink-0 rounded-md border border-(--bg-input) bg-(--bg-input) object-contain p-1"
          />
          <div className="flex flex-col">
            <span className="font-pixel text-sm font-bold text-(--text-accent)">
              {exercise?.name ?? "Unknown exercise"}
            </span>
            {exercise ? (
              <span className="text-xs text-(--text-muted)">
                {MUSCLE_GROUP_LABELS[exercise.primary_muscle]}
              </span>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          aria-label="Remove exercise"
          disabled={disabled}
          onClick={onRemove}
          className="p-1 text-(--text-muted) hover:text-(--text-danger) disabled:opacity-40"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 flex flex-col gap-2">{children}</div>
    </li>
  );
}
