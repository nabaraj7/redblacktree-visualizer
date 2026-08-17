import { Point } from "@/types/tree";

/* Minimal shape layout needs — decoupled from the RB tree's internal node type. */
export interface LayoutNode {
  id: string;
  left: LayoutNode | null;
  right: LayoutNode | null;
}

export const NODE_RADIUS = 26; // Define visual radius of each node in pixels
export const H_SPACING = 68;
export const V_SPACING = 100;

/*
 * Computes non-overlapping (x, y) coordinates for every node in the tree.
 *
 * Pass 1: walk the tree in-order, assigning each node a sequential slot index.
 * Pass 2 (bottom-up): a node with two children is centered above them; a node
 * with one child sits above that child; a leaf keeps its in-order slot.
 * This keeps subtrees compact and non-overlapping, similar in spirit to
 * Reingold-Tilford, without the full contour-tracking algorithm.
 */
export function computeLayout(root: LayoutNode | null): Map<string, Point> {
  const positions = new Map<string, Point>(); // Initialize map to store calculated node positions
  if (!root) return positions;

  let slot = 0; // Initialize horizontal slot counter for in-order traversal
  const slotX = new Map<string, number>(); // Map to store in-order slot index per node ID
  const depth = new Map<string, number>(); // Map to store depth level per node ID

  function assignSlots(node: LayoutNode | null, d: number) {
    if (!node) return;
    assignSlots(node.left, d + 1); // Recurse on left subtree with incremented depth
    slotX.set(node.id, slot);      // Store current slot index for node
    depth.set(node.id, d);         // Store depth level for node
    slot += 1;                     // Increment slot counter for next node
    assignSlots(node.right, d + 1); // Recurse on right subtree with incremented depth
  }
  assignSlots(root, 0); // Execute Pass 1 starting from root at depth 0

  function computeX(node: LayoutNode | null): number { // Helper function for Pass 2 (post-order coordinate resolution)
    if (!node) return 0; // Base case: return 0 if node is null
    const leftX = node.left ? computeX(node.left) : null; // Compute X coordinate of left child
    const rightX = node.right ? computeX(node.right) : null; // Compute X coordinate of right child

    let x: number; // Declare local X coordinate variable
    if (leftX !== null && rightX !== null) { // If node has both children
      x = (leftX + rightX) / 2; // Center node horizontally between children
    } else if (leftX !== null) { // If node has only left child
      x = leftX + H_SPACING / 2; // Offset node slightly to the right of left child
    } else if (rightX !== null) { // If node has only right child
      x = rightX - H_SPACING / 2; // Offset node slightly to the left of right child
    } else { // If node is a leaf
      x = (slotX.get(node.id) ?? 0) * H_SPACING; // Calculate position based on assigned slot index
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
  if (points.length === 0) { // Check if point set is empty
    return { minX: -200, maxX: 200, minY: -60, maxY: 200 }; // Return default bounds for empty state
  }
  const xs = points.map((p) => p.x); // Extract array of X coordinates
  const ys = points.map((p) => p.y); // Extract array of Y coordinates
  return {
    minX: Math.min(...xs) - padding, // Compute left boundary with padding
    maxX: Math.max(...xs) + padding, // Compute right boundary with padding
    minY: Math.min(...ys) - padding, // Compute top boundary with padding
    maxY: Math.max(...ys) + padding, // Compute bottom boundary with padding
  };
}