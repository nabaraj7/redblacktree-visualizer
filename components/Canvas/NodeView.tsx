"use client";

import { motion } from "framer-motion";
import { RenderedNode } from "@/types/tree";
import { NODE_RADIUS } from "@/lib/layout";

interface NodeViewProps {
  node: RenderedNode;
  isActive: boolean;
}

export default function NodeView({ node, isActive }: NodeViewProps) {
  const isRed = node.color === "RED";
  const fill = isRed ? "var(--color-node-red)" : "var(--color-node-black)";
  const stroke = isActive ? "var(--color-amber)" : isRed ? "var(--color-node-red-ring)" : "var(--color-node-black-ring)";

  return (
    <motion.g
      initial={{ x: node.position.x, y: node.position.y, opacity: 0, scale: 0.4 }}
      animate={{ x: node.position.x, y: node.position.y, opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.4 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
    >
      {isActive && (
        <motion.circle
          r={NODE_RADIUS + 7}
          fill="none"
          stroke="var(--color-amber)"
          strokeWidth={2}
          initial={{ opacity: 0.7, scale: 0.9 }}
          animate={{ opacity: [0.7, 0, 0.7], scale: [0.9, 1.35, 0.9] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      <circle r={NODE_RADIUS} fill={fill} stroke={stroke} strokeWidth={isActive ? 3 : 2} />
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-mono)"
        fontSize={16}
        fontWeight={600}
        fill="#ffffff"
      >
        {node.value}
      </text>
    </motion.g>
  );
}
