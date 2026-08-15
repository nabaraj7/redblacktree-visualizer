"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { RenderedNode } from "@/types/tree";
import { NODE_RADIUS } from "@/lib/layout";

interface NodeViewProps {
  node: RenderedNode;
  isActive: boolean;
}

export default memo(function NodeView({ node, isActive }: NodeViewProps) {
  const isRed = node.color === "RED";
  const fill = isRed ? "var(--color-node-red)" : "var(--color-node-black)";
  const stroke = isActive
    ? "var(--color-amber)"
    : isRed
    ? "var(--color-node-red-ring)"
    : "var(--color-node-black-ring)";

  return (
    <motion.g
      initial={{ x: node.position.x, y: node.position.y, opacity: 0, scale: 0.3 }}
      animate={{ x: node.position.x, y: node.position.y, opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.2 }}
      transition={{ type: "spring", stiffness: 220, damping: 22 }}
    >
      {/* Active Selection Glow Ring */}
      {isActive && (
        <circle
          r={NODE_RADIUS + 8}
          fill="none"
          stroke="var(--color-amber)"
          strokeWidth={2.5}
          opacity={0.6}
        />
      )}
      <circle
        r={NODE_RADIUS}
        fill={fill}
        stroke={stroke}
        strokeWidth={isActive ? 3 : 2}
        style={{
          filter: "drop-shadow(0 4px 6px rgba(15, 23, 42, 0.12))",
        }}
      />
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-mono)"
        fontSize={15}
        fontWeight={700}
        fill="#ffffff"
      >
        {node.value}
      </text>
    </motion.g>
  );
});