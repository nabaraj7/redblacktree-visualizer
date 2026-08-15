"use client";

import Image from "next/image";
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
    <header className="flex flex-wrap items-center justify-between gap-6 border-b border-hairline bg-panel px-5 py-3">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-panel-raised text-amber">
          <Image src="/redblacktree.svg" alt="Logo" width={32} height={32} />
        </div>
        <div className="flex items-center gap-1 uppercase tracking-wide">
          <h1 className="text-sm font-semibold leading-tight text-ink">Red-Black Tree Visualizer</h1>
        </div>
      </div>
      <div className="flex items-center gap-8">
        <Stat label="Total Nodes" value={stats.totalNodes} />
        <Stat label="Tree Height" value={stats.height} />
        <Stat label="Black Height" value={stats.blackHeight} />
      </div>

      
    </header>
  );
}
