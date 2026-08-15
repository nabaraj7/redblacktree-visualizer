"use client";

import { memo } from "react";
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

const INACTIVE_COLOR = "var(--color-hairline, #374151)";
const ACTIVE_COLOR = "var(--color-amber, #f59e0b)";

export default memo(function EdgeView({ edge }: EdgeViewProps) {
  const { x1, y1, x2, y2 } = trim(edge.from, edge.to, NODE_RADIUS);
  const targetStroke = edge.isActive ? ACTIVE_COLOR : INACTIVE_COLOR;

  return (
    <motion.line
      initial={{ x1, y1, x2, y2, opacity: 0, stroke: INACTIVE_COLOR }}
      animate={{ x1, y1, x2, y2, opacity: 1, stroke: targetStroke }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
      strokeWidth={edge.isActive ? 2.5 : 1.5}
      strokeLinecap="round"
    />
  );
});