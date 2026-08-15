"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RedBlackTree, computeTreeHeight, computeBlackHeight } from "@/lib/rbtree";
import { ActivityStep, OperationGroup, TreeStats } from "@/types/tree";
import StatsBar from "@/components/Header/StatsBar";
import TreeCanvas from "@/components/Canvas/TreeCanvas";
import ActivityLog from "@/components/Sidebar/ActivityLog";
import PlaybackBar from "@/components/Controls/PlaybackBar";
import InputPanel from "@/components/Panels/InputPanel";
import HelpPanel from "@/components/Panels/HelpPanel";
import ElementsPanel from "./Panels/ElementsPanel";

export default function Home() {
  const treeRef = useRef(new RedBlackTree());
  const [steps, setSteps] = useState<ActivityStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [playRangeEnd, setPlayRangeEnd] = useState<number | null>(null);

  const currentStep = currentStepIndex >= 0 ? steps[currentStepIndex] : null;

  const groups: OperationGroup[] = useMemo(() => {
    const map = new Map<string, OperationGroup>();
    const order: string[] = [];
    steps.forEach((s, idx) => {
      if (!map.has(s.operationId)) {
        map.set(s.operationId, { operationId: s.operationId, operationName: s.operationName, stepIndices: [] });
        order.push(s.operationId);
      }
      map.get(s.operationId)!.stepIndices.push(idx);
    });
    return order.map((id) => map.get(id)!);
  }, [steps]);

  const stats: TreeStats = useMemo(() => {
    if (!currentStep) return { insertedValue: null, totalNodes: 0, height: 0, blackHeight: 0 };
    const match = currentStep.operationName.match(/\((-?\d+)\)/);
    return {
      insertedValue: match ? Number(match[1]) : null,
      totalNodes: currentStep.nodes.length,
      height: computeTreeHeight(currentStep.nodes),
      blackHeight: computeBlackHeight(currentStep.nodes),
    };
  }, [currentStep]);

  const elements = useMemo(() => {
    if (!currentStep) return [];
    return [...currentStep.nodes].map((n) => n.value).sort((a, b) => a - b);
  }, [currentStep]);

  // Playback loop
  useEffect(() => {
    if (!isPlaying) return;
    const effectiveEnd = playRangeEnd ?? steps.length - 1;
    if (currentStepIndex >= effectiveEnd) {
      const stop = setTimeout(() => setIsPlaying(false), 0);
      return () => clearTimeout(stop);
    }
    const duration = 1600 / speed;
    const t = setTimeout(() => {
      setCurrentStepIndex((i) => Math.min(i + 1, effectiveEnd));
    }, duration);
    return () => clearTimeout(t);
  }, [isPlaying, currentStepIndex, steps.length, speed, playRangeEnd]);

  const appendSteps = (newSteps: ActivityStep[]) => {
    const jumpTo = steps.length;
    setSteps((prev) => [...prev, ...newSteps]);
    setCurrentStepIndex(jumpTo);
    setPlayRangeEnd(null);
    setIsPlaying(true);
  };

  const handleInsertValues = (values: number[]) => {
    const all: ActivityStep[] = [];
    values.forEach((v) => all.push(...treeRef.current.insert(v)));
    appendSteps(all);
  };
  const handleDeleteValues = (values: number[]) => {
    const all: ActivityStep[] = [];
    values.forEach((v) => all.push(...treeRef.current.delete(v)));
    appendSteps(all);
  };
  const handleReset = () => {
    treeRef.current.reset();
    setSteps([]);
    setCurrentStepIndex(-1);
    setIsPlaying(false);
    setPlayRangeEnd(null);
  };

  const jump = useCallback(
    (idx: number) => {
      setIsPlaying(false);
      setPlayRangeEnd(null);
      setCurrentStepIndex(Math.max(0, Math.min(steps.length - 1, idx)));
    },
    [steps.length]
  );

  const stepForward = useCallback(() => jump(currentStepIndex + 1), [jump, currentStepIndex]);
  const stepBack = useCallback(() => jump(currentStepIndex - 1), [jump, currentStepIndex]);

  const opForward = useCallback(() => {
    const gi = groups.findIndex((g) => g.operationId === currentStep?.operationId);
    const next = groups[gi + 1];
    if (next) jump(next.stepIndices[0]);
    else jump(steps.length - 1);
  }, [groups, currentStep, jump, steps.length]);

  const opBack = useCallback(() => {
    const gi = groups.findIndex((g) => g.operationId === currentStep?.operationId);
    const current = groups[gi];
    if (current && currentStepIndex > current.stepIndices[0]) {
      jump(current.stepIndices[0]);
    } else {
      const prev = groups[gi - 1];
      if (prev) jump(prev.stepIndices[0]);
    }
  }, [groups, currentStep, currentStepIndex, jump]);

  const replayFromStart = () => {
    if (steps.length === 0) return;
    setPlayRangeEnd(steps.length - 1);
    setCurrentStepIndex(0);
    setIsPlaying(true);
  };

  const playOperation = (group: OperationGroup) => {
    const start = group.stepIndices[0];
    const end = group.stepIndices[group.stepIndices.length - 1];
    setPlayRangeEnd(end);
    setCurrentStepIndex(start);
    setIsPlaying(true);
  };

  // Keyboard navigation: ArrowLeft/Right step, Shift+ArrowLeft/Right jump operations.
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (steps.length === 0) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (e.shiftKey) opForward();
        else stepForward();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (e.shiftKey) opBack();
        else stepBack();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [steps.length, opForward, opBack, stepForward, stepBack]);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <StatsBar stats={stats} elements={elements} />
      <div className="flex min-h-0 flex-1">
        <aside className="flex w-64 shrink-0 flex-col border-r border-hairline bg-panel">
          <InputPanel onInsert={handleInsertValues} onDelete={handleDeleteValues} onReset={handleReset} disabled={false} />
          <HelpPanel />
          <ElementsPanel 
          elements={elements}
          onDelete={(value) => handleDeleteValues([value])}
          />
        </aside>

        <main className="flex min-h-0 flex-1 flex-col">
          <TreeCanvas step={currentStep} />
          <PlaybackBar
            isPlaying={isPlaying}
            onTogglePlay={() =>
              setIsPlaying((p) => {
                if (!p) setPlayRangeEnd(null);
                return !p;
              })
            }
            onStepBack={stepBack}
            onStepForward={stepForward}
            onOpBack={opBack}
            onOpForward={opForward}
            onReplay={replayFromStart}
            speed={speed}
            onSpeedChange={setSpeed}
            currentStepIndex={Math.max(currentStepIndex, 0)}
            totalSteps={steps.length}
            disabled={steps.length === 0}
          />
        </main>

        <aside className="flex w-80 shrink-0 flex-col border-l border-hairline bg-panel">
          <div className="border-b border-hairline px-3 py-2.5">
            <h2 className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Activity Log</h2>
          </div>
          <div className="min-h-0 flex-1">
            <ActivityLog
              steps={steps}
              groups={groups}
              currentStepIndex={Math.max(currentStepIndex, 0)}
              onJump={jump}
              onPlayOperation={playOperation}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
