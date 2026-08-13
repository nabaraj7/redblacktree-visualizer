import { Point } from "@/types/tree";

/** Minimal shape layout needs — decoupled from the RB tree's internal node type. */
export interface LayoutNode {
  id: string;
  left: LayoutNode | null;
  right: LayoutNode | null;
}

export const NODE_RADIUS = 26;
export const H_SPACING = 68; // horizontal distance between adjacent in-order slots
export const V_SPACING = 100; // vertical distance between levels

/**
 * Computes non-overlapping (x, y) coordinates for every node in the tree.
 *
 * Pass 1: walk the tree in-order, assigning each node a sequential slot index.
 * Pass 2 (bottom-up): a node with two children is centered above them; a node
 * with one child sits above that child; a leaf keeps its in-order slot.
 * This keeps subtrees compact and non-overlapping, similar in spirit to
 * Reingold-Tilford, without the full contour-tracking algorithm.
 */
export function computeLayout(root: LayoutNode | null): Map<string, Point> {
  const positions = new Map<string, Point>();
  if (!root) return positions;

  let slot = 0;
  const slotX = new Map<string, number>();
  const depth = new Map<string, number>();

  function assignSlots(node: LayoutNode | null, d: number) {
    if (!node) return;
    assignSlots(node.left, d + 1);
    slotX.set(node.id, slot);
    depth.set(node.id, d);
    slot += 1;
    assignSlots(node.right, d + 1);
  }
  assignSlots(root, 0);

  function computeX(node: LayoutNode | null): number {
    if (!node) return 0;
    const leftX = node.left ? computeX(node.left) : null;
    const rightX = node.right ? computeX(node.right) : null;

    let x: number;
    if (leftX !== null && rightX !== null) {
      x = (leftX + rightX) / 2;
    } else if (leftX !== null) {
      x = leftX + H_SPACING / 2;
    } else if (rightX !== null) {
      x = rightX - H_SPACING / 2;
    } else {
      x = (slotX.get(node.id) ?? 0) * H_SPACING;
    }

    positions.set(node.id, { x, y: (depth.get(node.id) ?? 0) * V_SPACING });
    return x;
  }
  computeX(root);

  return positions;
}

export interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export function getBounds(points: Point[], padding = NODE_RADIUS + 70): Bounds {
  if (points.length === 0) {
    return { minX: -200, maxX: 200, minY: -60, maxY: 200 };
  }
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  return {
    minX: Math.min(...xs) - padding,
    maxX: Math.max(...xs) + padding,
    minY: Math.min(...ys) - padding,
    maxY: Math.max(...ys) + padding,
  };
}
