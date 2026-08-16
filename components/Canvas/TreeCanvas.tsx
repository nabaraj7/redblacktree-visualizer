"use client";

import { memo, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ActivityStep } from "@/types/tree";
import { getBounds, H_SPACING, V_SPACING } from "@/lib/layout";
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

const MIN_K = 0.35;
const MAX_K = 1.1;

export default memo(function TreeCanvas({ step }: TreeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, k: 1 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const autoCenter = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width === 0 || height === 0) return;

      if (!step || step.nodes.length === 0) {
        setTransform({ x: width / 2, y: height / 2, k: 1 });
        return;
      }

      const bounds = getBounds(step.nodes.map((n) => n.position));
      const treeW = Math.max(bounds.maxX - bounds.minX, 120);
      const treeH = Math.max(bounds.maxY - bounds.minY, 120);

      const paddingFactor = 0.78;
      const calculatedScale = Math.min(
        (width * paddingFactor) / treeW,
        (height * paddingFactor) / treeH,
        MAX_K
      );
      const k = Math.max(MIN_K, calculatedScale);

      const cx = (bounds.minX + bounds.maxX) / 2;
      const cy = (bounds.minY + bounds.maxY) / 2;

      setTransform({
        x: width / 2 - cx * k,
        y: height / 2 - cy * k,
        k,
      });
    };

    autoCenter();

    const observer = new ResizeObserver(autoCenter);
    observer.observe(el);
    return () => observer.disconnect();
  }, [step]);

  return (
    <div className="relative flex-1 min-h-0 overflow-hidden dot-grid bg-canvas select-none">
      <div ref={containerRef} className="absolute inset-0">
        <svg width="100%" height="100%">
          <motion.g
            animate={{
              transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`,
            }}
            transition={{ type: "spring", stiffness: 180, damping: 24 }}
          >
            <AnimatePresence>
              {step?.edges.map((edge) => (
                <EdgeView key={edge.id} edge={edge} />
              ))}
            </AnimatePresence>
            <AnimatePresence>
              {step?.nodes.map((node) => (
                <NodeView
                  key={node.id}
                  node={node}
                  isActive={step.activeNodeIds.includes(node.id)}
                />
              ))}
            </AnimatePresence>
          </motion.g>
        </svg>
      </div>

      {(!step || step.nodes.length === 0) && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p className="font-mono text-xs text-ink-muted">
            Insert values to build the Red-Black tree
          </p>
        </div>
      )}
    </div>
  );
});