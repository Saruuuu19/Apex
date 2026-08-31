"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";

import { MUSCLE_GROUP_LABELS } from "@/data/exercises";
import type { Exercise } from "@/types";

export function ExerciseSheet({
  open,
  onClose,
  exercises,
  title = "Add exercises",
  confirmLabel = "Add",
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  exercises: Exercise[];
  title?: string;
  confirmLabel?: string;
  onConfirm: (ids: string[]) => Promise<void> | void;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [pending, setPending] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return exercises;
    return exercises.filter(
      (exercise) =>
        exercise.name.toLowerCase().includes(q) ||
        MUSCLE_GROUP_LABELS[exercise.primary_muscle].toLowerCase().includes(q),
    );
  }, [exercises, query]);

  if (!open) return null;

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function handleClose() {
    setQuery("");
    setSelected([]);
    onClose();
  }

  async function handleConfirm() {
    if (selected.length === 0) return;
    setPending(true);
    try {
      await onConfirm(selected);
      setQuery("");
      setSelected([]);
      onClose();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={handleClose}
        aria-hidden="true"
      />
      <div className="relative flex h-[85vh] w-full flex-col rounded-t-2xl border-t border-(--bg-input) bg-(--bg)">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="font-pixel text-xl font-bold">{title}</h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="p-1 text-(--text-muted) hover:text-(--text)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 pb-3">
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-(--text-muted)"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search exercises"
              className="h-10 w-full rounded-md border border-(--bg-input) bg-(--bg-input) pr-3 pl-10 font-mono text-(--text) placeholder:text-(--text-muted)"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4">
          {filtered.length === 0 ? (
            <p className="px-2 py-8 text-center text-sm text-(--text-muted)">
              No exercises found
            </p>
          ) : (
            <ul className="flex flex-col gap-1">
              {filtered.map((exercise) => {
                const isSelected = selected.includes(exercise.id);
                return (
                  <li key={exercise.id}>
                    <button
                      type="button"
                      onClick={() => toggle(exercise.id)}
                      className="flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors"
                      style={{
                        borderColor: isSelected
                          ? "var(--text-link)"
                          : "transparent",
                      }}
                    >
                      <span className="flex flex-col">
                        <span className="font-pixel text-sm font-semibold">
                          {exercise.name}
                        </span>
                        <span className="text-xs text-(--text-muted)">
                          {MUSCLE_GROUP_LABELS[exercise.primary_muscle]}
                        </span>
                      </span>
                      {isSelected ? (
                        <span className="font-pixel text-sm font-semibold text-(--text-link)">
                          ✓
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-(--bg-input) px-5 py-4">
          <button
            type="button"
            disabled={selected.length === 0 || pending}
            onClick={handleConfirm}
            className="h-10 w-full rounded-md bg-(--button-bg) font-bold text-white transition-colors hover:bg-(--button-bg-hover) disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending
              ? "Adding..."
              : `${confirmLabel}${selected.length ? ` (${selected.length})` : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}
