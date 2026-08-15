"use client";

import { memo, useState } from "react";
import { Plus, Trash2, RotateCcw } from "lucide-react";

interface InputPanelProps {
  onInsert: (values: number[]) => void;
  onDelete: (values: number[]) => void;
  onReset: () => void;
  disabled: boolean;
}

function parseValues(raw: string): number[] | null {
  const parts = raw
    .split(/[, ]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (parts.length === 0) return null;
  const values = parts.map(Number);
  if (values.some((v) => !Number.isFinite(v) || !Number.isInteger(v))) return null;
  return values;
}

export default memo(function InputPanel({ onInsert, onDelete, onReset, disabled }: InputPanelProps) {
  const [insertVal, setInsertVal] = useState("");
  const [deleteVal, setDeleteVal] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submitInsert = () => {
    const values = parseValues(insertVal);
    if (!values) {
      setError("Enter valid integers (e.g., 10 or 10, 20, 15)");
      return;
    }
    setError(null);
    onInsert(values);
    setInsertVal("");
  };

  const submitDelete = () => {
    const values = parseValues(deleteVal);
    if (!values) {
      setError("Enter valid integers (e.g., 10 or 10, 20, 15)");
      return;
    }
    setError(null);
    onDelete(values);
    setDeleteVal("");
  };

  return (
    <div className="space-y-3 border-b border-hairline p-3">
      <div>
        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
          Insert
        </label>
        <div className="flex gap-1.5">
          <input
            value={insertVal}
            onChange={(e) => setInsertVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitInsert()}
            placeholder="10, 20, 15, 5"
            disabled={disabled}
            className="w-full flex-1 rounded-md border border-hairline bg-panel-raised px-2.5 py-1.5 font-mono text-xs text-ink placeholder:text-ink-faint focus:border-amber/60 focus:outline-none disabled:opacity-50"
          />
          <button
            type="button"
            onClick={submitInsert}
            disabled={disabled}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-amber text-white transition hover:brightness-110 disabled:opacity-40"
            aria-label="Insert"
          >
            <Plus size={15} />
          </button>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
          Delete
        </label>
        <div className="flex gap-1.5">
          <input
            value={deleteVal}
            onChange={(e) => setDeleteVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitDelete()}
            placeholder="15, 30"
            disabled={disabled}
            className="w-full flex-1 rounded-md border border-hairline bg-panel-raised px-2.5 py-1.5 font-mono text-xs text-ink placeholder:text-ink-faint focus:border-amber/60 focus:outline-none disabled:opacity-50"
          />
          <button
            type="button"
            onClick={submitDelete}
            disabled={disabled}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-hairline text-ink-muted transition hover:bg-panel-raised hover:text-ink disabled:opacity-40"
            aria-label="Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {error && <p className="text-[11px] text-node-red">{error}</p>}

      <button
        type="button"
        onClick={onReset}
        disabled={disabled}
        className="flex w-full items-center justify-center gap-1.5 rounded-md border border-hairline py-1.5 text-[11px] font-medium text-ink-muted transition hover:bg-panel-raised hover:text-ink disabled:opacity-40"
      >
        <RotateCcw size={12} /> Reset Tree
      </button>
    </div>
  );
});