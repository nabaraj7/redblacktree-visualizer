"use client";

import { GitCompareArrows } from "lucide-react";
import { TreeStats } from "@/types/tree";

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-wide text-ink-faint">{label}</span>
      <span className="font-mono text-sm font-semibold text-ink">{value}</span>
    </div>
  );
}

export default function StatsBar({ stats, elements }: { stats: TreeStats; elements: number[] }) {
  return (
    <header className="flex flex-wrap items-center gap-6 border-b border-hairline bg-panel px-5 py-3">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-panel-raised text-amber">
          <GitCompareArrows size={16} />
        </div>
        <div>
          <h1 className="text-sm font-semibold leading-tight text-ink">Red-Black Tree Visualizer</h1>
          <p className="text-[10px] leading-tight text-ink-faint">insert · delete · rotate · recolor</p>
        </div>
      </div>
      <div className="h-8 w-px bg-hairline" />
      <div className="flex items-center gap-8">
        <Stat label="Inserted Value" value={stats.insertedValue ?? "—"} />
        <Stat label="Total Nodes" value={stats.totalNodes} />
        <Stat label="Tree Height" value={stats.height} />
        <Stat label="Black Height" value={stats.blackHeight} />
      </div>

      <div className="ml-auto flex min-w-0 items-center gap-2">
        <div className="h-8 w-px bg-hairline" />
        <span className="shrink-0 text-[10px] uppercase tracking-wide text-ink-faint">
          Elements{elements.length > 0 ? ` (${elements.length})` : ""}
        </span>
        {elements.length === 0 ? (
          <span className="font-mono text-sm text-ink-faint">—</span>
        ) : (
          <div className="flex max-w-md flex-wrap justify-end gap-1.5">
            {elements.map((v) => (
              <span
                key={v}
                className="rounded-md border border-hairline bg-panel-raised px-2 py-0.5 font-mono text-[12px] text-ink"
              >
                {v}
              </span>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
