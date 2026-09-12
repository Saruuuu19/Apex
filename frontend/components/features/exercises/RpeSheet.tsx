"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";

import { cn } from "@/lib/utils";

const RPE_OPTIONS = [7, 7.5, 8, 8.5, 9, 9.5, 10];

export function RpeSheet({
  setNumber,
  weight,
  reps,
  value,
  onConfirm,
  onClose,
}: {
  setNumber: number;
  weight: string;
  reps: string;
  value: number | null;
  onConfirm: (rpe: number | null) => void;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<number | null>(() => {
    if (value === null || value === undefined) return null;
    const parsed = Number(value);
    return RPE_OPTIONS.includes(parsed) ? parsed : null;
  });

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Log set RPE"
        className="relative flex w-full flex-col rounded-t-2xl border-t border-(--bg-input) bg-(--bg) px-5 pt-4 pb-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-pixel text-xl font-bold">Log Set RPE</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1 text-(--text-muted) hover:text-(--text)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-1 font-mono text-xs text-(--text-muted)">
          Set {setNumber}: {weight || "—"} KG x {reps || "—"} reps
        </p>

        <div className="my-4 h-px w-full bg-(--bg-input)" />

        <p className="mb-2 font-mono text-xs tracking-wider text-(--text-secondary) uppercase">
          Select RPE
        </p>

        <div className="grid grid-cols-7 gap-0.5 rounded-lg bg-(--bg-input) p-0.5">
          {RPE_OPTIONS.map((option) => {
            const isSelected = selected === option;
            return (
              <button
                key={option}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelected(isSelected ? null : option)}
                className={cn(
                  "flex h-10 min-w-0 items-center justify-center rounded-md font-mono text-xs transition-colors sm:text-sm",
                  isSelected
                    ? "bg-(--button-bg) font-bold text-white"
                    : "text-(--text-secondary) hover:bg-(--bg-input-hover) hover:text-(--text)",
                )}
              >
                {option}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onConfirm(selected)}
          className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-(--button-bg) font-bold text-white transition-colors hover:bg-(--button-bg-hover)"
        >
          <Check className="h-4 w-4" />
          Done
        </button>
      </div>
    </div>
  );
}
