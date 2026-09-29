"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";

import {
  SET_TYPE_DESCRIPTIONS,
  SET_TYPE_LABELS,
  SET_TYPE_TEXT,
} from "@/data/exercises";
import { cn } from "@/lib/utils";
import type { SetType } from "@/types";

const SET_TYPE_OPTIONS: SetType[] = [
  "WARM_UP",
  "NORMAL",
  "DROP_SET",
  "FAILURE",
];

export function SetTypeSheet({
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
  value: SetType;
  onConfirm: (type: SetType) => void;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<SetType>(value);

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
        aria-label="Set type"
        className="relative flex w-full flex-col rounded-t-2xl border-t border-(--bg-input) bg-(--bg) px-5 pt-4 pb-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-pixel text-xl font-bold">Set Type</h2>
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

        <div className="flex flex-col gap-1.5">
          {SET_TYPE_OPTIONS.map((type) => {
            const isSelected = selected === type;
            return (
              <button
                key={type}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelected(type)}
                className={cn(
                  "flex w-full flex-col items-start gap-0.5 rounded-lg px-4 py-3 text-left transition-colors",
                  isSelected
                    ? "bg-(--button-bg)"
                    : "bg-(--bg-input) hover:bg-(--bg-input-hover)",
                )}
              >
                <span
                  className={cn(
                    "font-pixel text-sm font-bold",
                    isSelected ? "text-white" : SET_TYPE_TEXT[type],
                  )}
                >
                  {SET_TYPE_LABELS[type]}
                </span>
                <span
                  className={cn(
                    "text-xs",
                    isSelected ? "text-white/75" : "text-(--text-muted)",
                  )}
                >
                  {SET_TYPE_DESCRIPTIONS[type]}
                </span>
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
