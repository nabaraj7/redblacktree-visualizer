"use client";

import { memo } from "react";

export default memo(function HelpPanel() {
  return (
    <section className="space-y-3 border-b border-hairline p-3">
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
        Navigation Shortcuts
      </h3>
      <div className="flex flex-col gap-2 font-mono text-[11px] text-ink-muted">
        <div className="flex items-center justify-between">
          <span>Steps</span>
          <div className="flex items-center gap-1">
            <kbd className="rounded border border-hairline bg-panel-raised px-1.5 py-0.5 text-[10px] font-semibold text-ink shadow-xs">
              ←
            </kbd>
            <span className="text-ink-faint">/</span>
            <kbd className="rounded border border-hairline bg-panel-raised px-1.5 py-0.5 text-[10px] font-semibold text-ink shadow-xs">
              →
            </kbd>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span>Operations</span>
          <div className="flex items-center gap-1">
            <kbd className="rounded border border-hairline bg-panel-raised px-1.5 py-0.5 text-[10px] font-semibold text-ink shadow-xs">
              Shift
            </kbd>
            <span className="text-ink-faint">+</span>
            <kbd className="rounded border border-hairline bg-panel-raised px-1.5 py-0.5 text-[10px] font-semibold text-ink shadow-xs">
              ←
            </kbd>
            <span className="text-ink-faint">/</span>
            <kbd className="rounded border border-hairline bg-panel-raised px-1.5 py-0.5 text-[10px] font-semibold text-ink shadow-xs">
              →
            </kbd>
          </div>
        </div>
      </div>
    </section>
  );
});