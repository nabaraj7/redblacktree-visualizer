"use client";

import { motion } from "framer-motion";
import { TreeEdge } from "@/types/tree";
import { NODE_RADIUS } from "@/lib/layout";

interface EdgeViewProps {
  edge: TreeEdge;
}

function trim(from: { x: number; y: number }, to: { x: number; y: number }, radius: number) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / dist;
  const uy = dy / dist;
  return {
    x1: from.x + ux * radius,
    y1: from.y + uy * radius,
    x2: to.x - ux * radius,
    y2: to.y - uy * radius,
  };
}

export default function EdgeView({ edge }: EdgeViewProps) {
  const { x1, y1, x2, y2 } = trim(edge.from, edge.to, NODE_RADIUS);
  const stroke = edge.isActive ? "var(--color-cyan)" : "var(--color-hairline)";

  return (
    <motion.line
      initial={{ x1, y1, x2, y2, opacity: 0 }}
      animate={{ x1, y1, x2, y2, opacity: 1, stroke }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      strokeWidth={edge.isActive ? 3 : 2}
      strokeLinecap="round"
      style={edge.isActive ? { filter: "drop-shadow(0 0 4px var(--color-cyan))" } : undefined}
    />
  );
}
