"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useGesture } from "@use-gesture/react";
import { AnimatePresence } from "framer-motion";
import { Plus, Minus, Maximize2 } from "lucide-react";
import { ActivityStep } from "@/types/tree";
import { getBounds } from "@/lib/layout";
import NodeView from "./NodeView";
import EdgeView from "./EdgeView";

interface TreeCanvasProps {
  step: ActivityStep | null;
}

interface Transform {
  x: number;
  y: number;
  k: number;
}

const MIN_K = 0.25;
const MAX_K = 1.6;

export default function TreeCanvas({ step }: TreeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, k: 1 });
  const lastOpId = useRef<string | null>(null);
  const stepRef = useRef(step);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  // Stable identity so it can be used both for mount/resize (subscribed once)
  // and for the per-operation refit below, without re-subscribing constantly.
  const fitToScreen = useCallback(() => {
    const el = containerRef.current;
    const currentStep = stepRef.current;
    if (!el || !currentStep || currentStep.nodes.length === 0) return;
    const { width, height } = el.getBoundingClientRect();
    if (width === 0 || height === 0) return;
    const bounds = getBounds(currentStep.nodes.map((n) => n.position));
    const treeW = bounds.maxX - bounds.minX;
    const treeH = bounds.maxY - bounds.minY;
    const k = Math.min(width / treeW, height / treeH, MAX_K);
    const clampedK = Math.max(MIN_K, Math.min(k, MAX_K));
    const cx = (bounds.minX + bounds.maxX) / 2;
    const cy = (bounds.minY + bounds.maxY) / 2;
    setTransform({
      x: width / 2 - cx * clampedK,
      y: height / 2 - cy * clampedK,
      k: clampedK,
    });
  }, []);

  // Auto re-fit whenever a new operation starts (keeps pan/zoom stable mid-operation).
  useEffect(() => {
    if (!step) return;
    if (step.operationId !== lastOpId.current) {
      lastOpId.current = step.operationId;
      fitToScreen();
    }
  }, [step, fitToScreen]);

  // Initial fit once the container has a real size, and re-fit on container resize.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    fitToScreen();
    const ro = new ResizeObserver(() => fitToScreen());
    ro.observe(el);
    return () => ro.disconnect();
  }, [fitToScreen]);

  useGesture(
    {
      onDrag: ({ delta: [dx, dy] }) => {
        setTransform((t) => ({ ...t, x: t.x + dx, y: t.y + dy }));
      },
      onWheel: ({ delta: [, dy], event }) => {
        event.preventDefault();
        setTransform((t) => {
          const nextK = Math.max(MIN_K, Math.min(MAX_K, t.k * (1 - dy * 0.001)));
          return { ...t, k: nextK };
        });
      },
    },
    {
      target: containerRef,
      eventOptions: { passive: false },
      drag: { filterTaps: true },
    }
  );

  const zoomBy = (factor: number) => {
    setTransform((t) => ({ ...t, k: Math.max(MIN_K, Math.min(MAX_K, t.k * factor)) }));
  };

  return (
    <div className="relative flex-1 min-h-0 overflow-hidden dot-grid bg-canvas">
      <div ref={containerRef} className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing">
        <svg width="100%" height="100%">
          <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}>
            <AnimatePresence>
              {step?.edges.map((edge) => (
                <EdgeView key={edge.id} edge={edge} />
              ))}
            </AnimatePresence>
            <AnimatePresence>
              {step?.nodes.map((node) => (
                <NodeView key={node.id} node={node} isActive={step.activeNodeIds.includes(node.id)} />
              ))}
            </AnimatePresence>
          </g>
        </svg>
      </div>

      {(!step || step.nodes.length === 0) && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p className="font-mono text-sm text-ink-muted">Insert a value to build the tree</p>
        </div>
      )}

      <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 rounded-xl border border-hairline bg-panel/90 p-1.5 shadow-lg backdrop-blur">
        <button
          onClick={() => zoomBy(1.2)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted transition hover:bg-panel-raised hover:text-ink"
          aria-label="Zoom in"
        >
          <Plus size={16} />
        </button>
        <button
          onClick={() => zoomBy(1 / 1.2)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted transition hover:bg-panel-raised hover:text-ink"
          aria-label="Zoom out"
        >
          <Minus size={16} />
        </button>
        <button
          onClick={fitToScreen}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted transition hover:bg-panel-raised hover:text-ink"
          aria-label="Fit to screen"
        >
          <Maximize2 size={16} />
        </button>
      </div>
    </div>
  );
}
