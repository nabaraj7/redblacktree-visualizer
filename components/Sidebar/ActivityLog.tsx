"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, GitBranch, Palette, RefreshCw, CheckCircle2, Play } from "lucide-react";
import { ActivityStep, OperationGroup } from "@/types/tree";

interface ActivityLogProps {
  steps: ActivityStep[];
  groups: OperationGroup[];
  currentStepIndex: number;
  onJump: (index: number) => void;
  onPlayOperation: (group: OperationGroup) => void;
}

const typeIcon: Record<ActivityStep["type"], React.ReactNode> = {
  COMPARISON: <GitBranch size={13} />,
  RECOLOR: <Palette size={13} />,
  ROTATION: <RefreshCw size={13} />,
  BALANCED: <CheckCircle2 size={13} />,
};

const typeColor: Record<ActivityStep["type"], string> = {
  COMPARISON: "text-ink-muted",
  RECOLOR: "text-amber",
  ROTATION: "text-cyan",
  BALANCED: "text-emerald-600",
};

export default function ActivityLog({ steps, groups, currentStepIndex, onJump, onPlayOperation }: ActivityLogProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const activeRef = useRef<HTMLButtonElement>(null);
  const currentStep = steps[currentStepIndex];

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [currentStepIndex]);

  const toggle = (opId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(opId)) next.delete(opId);
      else next.add(opId);
      return next;
    });
  };

  if (groups.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center">
        <p className="font-mono text-xs text-ink-muted">Activity will appear here once you insert or delete a value.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto p-2">
      {groups.map((group) => {
        const isOpen = expanded.has(group.operationId) || currentStep?.operationId === group.operationId;
        const isActiveGroup = currentStep?.operationId === group.operationId;
        return (
          <div key={group.operationId} className="mb-1.5 overflow-hidden rounded-lg border border-hairline bg-panel-raised/40">
            <div
              className={`flex w-full items-center justify-between px-1.5 py-1.5 text-left transition ${
                isActiveGroup ? "bg-panel-raised" : "hover:bg-panel-raised/60"
              }`}
            >
              <button
                onClick={() =>
                  onPlayOperation(group)
                }
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-ink-muted transition hover:bg-panel hover:text-amber"
                aria-label={`Play ${group.operationName}`}
                title={`Play ${group.operationName}`}
              >
                <Play size={12} className="ml-0.5" />
              </button>
              <button onClick={() => toggle(group.operationId)} className="flex flex-1 items-center justify-between py-1 pl-1 pr-2 text-left">
                <span className="font-mono text-[13px] font-semibold text-ink">{group.operationName}</span>
                <span className="flex items-center gap-2">
                  <span className="text-[10px] text-ink-faint">{group.stepIndices.length} steps</span>
                  <ChevronDown size={14} className={`text-ink-muted transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </span>
              </button>
            </div>
            {isOpen && (
              <div className="space-y-0.5 px-2 pb-2">
                {group.stepIndices.map((idx) => {
                  const s = steps[idx];
                  const isActive = idx === currentStepIndex;
                  return (
                    <button
                      key={s.id}
                      ref={isActive ? activeRef : undefined}
                      onClick={() => onJump(idx)}
                      className={`flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-[12px] leading-snug transition ${
                        isActive ? "bg-amber/15 text-ink ring-1 ring-amber/40" : "text-ink-muted hover:bg-panel-raised hover:text-ink"
                      }`}
                    >
                      <span className={`mt-0.5 shrink-0 ${typeColor[s.type]}`}>{typeIcon[s.type]}</span>
                      <span>{s.description}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
