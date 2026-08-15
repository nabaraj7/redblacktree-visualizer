"use client";

import { memo } from "react";
import Image from "next/image";
import { TreeStats } from "@/types/tree";

const Stat = memo(({ label, value }: { label: string; value: string | number }) => (
  <div className="flex flex-col">
    <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">{label}</span>
    <span className="font-mono text-sm font-bold text-ink">{value}</span>
  </div>
));
Stat.displayName = "Stat";

export default memo(function StatsBar({ stats }: { stats: TreeStats }) {
  return (
    <header className="flex items-center justify-between border-b border-hairline bg-panel px-5 py-2.5">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-panel-raised text-amber">
          <Image src="/redblacktree.svg" alt="Logo" width={24} height={24} />
        </div>
        <h1 className="text-sm font-semibold tracking-wide text-ink uppercase">Red-Black Tree Visualizer</h1>
      </div>

      <div className="flex items-center gap-8">
        <Stat label="Total Nodes" value={stats.totalNodes} />
        <Stat label="Tree Height" value={stats.height} />
        <Stat label="Black Height" value={stats.blackHeight} />
      </div>
    </header>
  );
});