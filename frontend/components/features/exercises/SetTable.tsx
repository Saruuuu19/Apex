"use client";

import { useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { Check, Gauge, Trash2 } from "lucide-react";

import { RpeSheet } from "@/components/features/exercises/RpeSheet";
import { SET_TYPE_ABBR, SET_TYPE_LABELS } from "@/data/exercises";
import { cn, parseNumberOrNull } from "@/lib/utils";
import type { SetType } from "@/types";

export type SetTableRow = {
  id: string;
  order: number;
  set_type: SetType;
  weight: number | null;
  reps: number | null;
  rpe: number | null;
  completed: boolean;
};

export type SetTablePatch = Partial<Omit<SetTableRow, "id" | "order">>;

const DELETE_WIDTH = 72;
const SWIPE_THRESHOLD = 8;

function formatNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "";
  const text = String(value);
  if (!text.includes(".")) return text;
  return text.replace(/0+$/, "").replace(/\.$/, "");
}

function NumberInput({
  label,
  placeholder,
  initial,
  inputMode,
  disabled,
  flat,
  onCommit,
}: {
  label: string;
  placeholder: string;
  initial: string;
  inputMode: "decimal" | "numeric";
  disabled: boolean;
  flat: boolean;
  onCommit: (value: string) => void;
}) {
  const [value, setValue] = useState(initial);

  return (
    <input
      type="text"
      inputMode={inputMode}
      autoComplete="off"
      enterKeyHint="done"
      placeholder={placeholder}
      value={value}
      disabled={disabled}
      aria-label={label}
      onChange={(event) => setValue(event.target.value)}
      onBlur={() => onCommit(value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.currentTarget.blur();
      }}
      className={cn(
        "h-9 w-full min-w-0 rounded-md px-1 text-center font-mono text-sm text-(--text) placeholder:text-(--text-muted) disabled:opacity-40 sm:text-xs",
        flat
          ? "focus-visible:bg-(--bg-input-hover)"
          : "border border-(--bg-input) bg-(--bg-input)",
      )}
    />
  );
}

function SetRow({
  row,
  showRpe,
  checkable,
  disabled,
  busy,
  flat,
  gridStyle,
  open,
  onOpenChange,
  onOpenRpe,
  onUpdate,
  onRemove,
}: {
  row: SetTableRow;
  showRpe: boolean;
  checkable: boolean;
  disabled: boolean;
  busy: boolean;
  flat: boolean;
  gridStyle: CSSProperties;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenRpe: (rowId: string) => void;
  onUpdate: (id: string, patch: SetTablePatch) => void;
  onRemove: (id: string) => void;
}) {
  const [dragOffset, setDragOffset] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const offset = dragOffset ?? (open ? -DELETE_WIDTH : 0);
  const drag = useRef<{
    x: number;
    y: number;
    startOffset: number;
    dragging: boolean;
  } | null>(null);

  function commitNumber(field: "weight" | "reps", text: string) {
    if (text === formatNumber(row[field])) return;
    const value = parseNumberOrNull(text);
    onUpdate(row.id, field === "weight" ? { weight: value } : { reps: value });
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (disabled || busy) return;
    const target = event.target as HTMLElement;
    if (
      event.pointerType === "mouse" &&
      target.closest("input, button, select")
    ) {
      return;
    }
    setDragOffset(open ? -DELETE_WIDTH : 0);
    drag.current = {
      x: event.clientX,
      y: event.clientY,
      startOffset: open ? -DELETE_WIDTH : 0,
      dragging: false,
    };
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const state = drag.current;
    if (!state) return;
    const dx = event.clientX - state.x;
    const dy = event.clientY - state.y;
    if (!state.dragging) {
      if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;
      state.dragging = true;
      setDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    setDragOffset(Math.min(0, Math.max(-DELETE_WIDTH, state.startOffset + dx)));
  }

  function handlePointerEnd() {
    const state = drag.current;
    drag.current = null;
    setDragging(false);
    setDragOffset(null);
    if (!state?.dragging) return;
    onOpenChange(offset <= -DELETE_WIDTH / 2);
  }

  return (
    <li className="relative overflow-hidden rounded-md" data-set-row={row.id}>
      <div
        className={cn(
          "relative z-10 grid touch-pan-y items-center gap-2 bg-(--bg) px-0.5 py-0.5",
          !dragging &&
            "motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out",
        )}
        style={{
          ...gridStyle,
          transform: `translateX(${offset}px)`,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        <select
          value={row.set_type}
          disabled={disabled || busy}
          aria-label="Set type"
          title={`Set type: ${SET_TYPE_LABELS[row.set_type]}`}
          onChange={(event) =>
            onUpdate(row.id, { set_type: event.target.value as SetType })
          }
          className={cn(
            "h-9 w-9 appearance-none rounded-md text-center font-mono text-xs text-(--text) disabled:opacity-40",
            flat
              ? "focus-visible:bg-(--bg-input-hover)"
              : "border border-(--bg-input) bg-(--bg-input)",
          )}
        >
          {Object.entries(SET_TYPE_ABBR).map(([value, abbr]) => (
            <option key={value} value={value}>
              {abbr}
            </option>
          ))}
        </select>

        <NumberInput
          label="Weight (kg)"
          placeholder="kg"
          initial={formatNumber(row.weight)}
          inputMode="decimal"
          disabled={disabled}
          flat={flat}
          onCommit={(text) => commitNumber("weight", text)}
        />

        <NumberInput
          label="Reps"
          placeholder="reps"
          initial={formatNumber(row.reps)}
          inputMode="numeric"
          disabled={disabled}
          flat={flat}
          onCommit={(text) => commitNumber("reps", text)}
        />

        {showRpe ? (
          <button
            type="button"
            disabled={disabled || busy}
            aria-label={`RPE: ${formatNumber(row.rpe) || "empty"}`}
            aria-haspopup="dialog"
            onClick={() => onOpenRpe(row.id)}
            className={cn(
              "flex h-9 w-full min-w-0 items-center justify-center gap-1 rounded-md font-mono text-sm text-(--text) transition-colors disabled:opacity-40",
              flat
                ? "hover:bg-(--bg-input-hover) focus-visible:bg-(--bg-input-hover)"
                : "border border-(--bg-input) bg-(--bg-input) hover:border-(--text-secondary)",
            )}
          >
            {formatNumber(row.rpe) ? (
              formatNumber(row.rpe)
            ) : (
              <Gauge
                aria-hidden="true"
                className="h-3 w-3 shrink-0 text-(--text-muted)"
              />
            )}
          </button>
        ) : null}

        {checkable ? (
          <button
            type="button"
            aria-pressed={row.completed}
            aria-label={
              row.completed
                ? `Set ${row.order + 1} completed`
                : `Mark set ${row.order + 1} as completed`
            }
            disabled={disabled || busy}
            onClick={() => onUpdate(row.id, { completed: !row.completed })}
            className={cn(
              "flex h-9 w-9 items-center justify-center justify-self-center rounded-md transition-colors disabled:opacity-40",
              flat
                ? row.completed
                  ? "bg-(--button-bg) text-white"
                  : "text-(--text-muted) hover:text-(--text) focus-visible:bg-(--bg-input-hover)"
                : row.completed
                  ? "border border-transparent bg-(--button-bg) text-white"
                  : "border border-(--bg-input) text-(--text-muted) hover:text-(--text)",
            )}
          >
            <Check className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="absolute inset-y-0 right-0 flex w-18 items-center justify-center bg-(--button-danger-bg)">
        <button
          type="button"
          aria-label={`Delete set ${row.order + 1}`}
          disabled={disabled || busy}
          onClick={() => onRemove(row.id)}
          onFocus={() => onOpenChange(true)}
          className="flex h-full w-full items-center justify-center text-white"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
}

export function SetTable({
  sets,
  showRpe = false,
  checkable = false,
  disabled = false,
  busy = false,
  variant = "default",
  onUpdate,
  onRemove,
}: {
  sets: SetTableRow[];
  showRpe?: boolean;
  checkable?: boolean;
  disabled?: boolean;
  busy?: boolean;
  variant?: "default" | "flat";
  onUpdate: (id: string, patch: SetTablePatch) => void;
  onRemove: (id: string) => void;
}) {
  const [openRowId, setOpenRowId] = useState<string | null>(null);
  const [rpeRowId, setRpeRowId] = useState<string | null>(null);
  const flat = variant === "flat";

  const sortedSets = useMemo(
    () => sets.slice().sort((a, b) => a.order - b.order),
    [sets],
  );
  const rpeRow = rpeRowId
    ? sortedSets.find((set) => set.id === rpeRowId)
    : undefined;

  const columns = ["2.25rem", "minmax(0,1fr)", "minmax(0,1fr)"];
  if (showRpe) columns.push("minmax(0,1fr)");
  if (checkable) columns.push("2.25rem");
  const gridStyle: CSSProperties = {
    gridTemplateColumns: columns.join(" "),
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="grid items-center gap-2 px-0.5 font-mono text-xs font-medium tracking-wider text-(--text-secondary) uppercase"
        style={gridStyle}
      >
        <span>Set</span>
        <span className="text-center">KG</span>
        <span className="text-center">Reps</span>
        {showRpe ? <span className="text-center">RPE</span> : null}
        {checkable ? (
          <span className="flex justify-center">
            <Check aria-hidden="true" className="h-3.5 w-3.5" />
          </span>
        ) : null}
      </div>

      <ul className="flex flex-col gap-2">
        {sortedSets.map((row) => (
          <SetRow
            key={row.id}
            row={row}
            showRpe={showRpe}
            checkable={checkable}
            disabled={disabled}
            busy={busy}
            flat={flat}
            gridStyle={gridStyle}
            open={openRowId === row.id}
            onOpenChange={(open) => setOpenRowId(open ? row.id : null)}
            onOpenRpe={setRpeRowId}
            onUpdate={onUpdate}
            onRemove={onRemove}
          />
        ))}
      </ul>

      {rpeRow ? (
        <RpeSheet
          key={rpeRow.id}
          setNumber={rpeRow.order + 1}
          weight={formatNumber(rpeRow.weight)}
          reps={formatNumber(rpeRow.reps)}
          value={rpeRow.rpe}
          onClose={() => setRpeRowId(null)}
          onConfirm={(rpe) => {
            if (formatNumber(rpe) !== formatNumber(rpeRow.rpe)) {
              onUpdate(rpeRow.id, { rpe });
            }
            setRpeRowId(null);
          }}
        />
      ) : null}
    </div>
  );
}
