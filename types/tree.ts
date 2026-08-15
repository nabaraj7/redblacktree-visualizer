export interface Point {
  x: number;
  y: number;
}

export type NodeColor = "RED" | "BLACK";

export interface RenderedNode {
  id: string;
  value: number;
  color: NodeColor;
  position: Point;
  parentId?: string;
  leftId?: string;
  rightId?: string;
  isNil?: boolean;
}

export interface TreeEdge {
  id: string; // e.g. "edge-parent15-child10"
  from: Point;
  to: Point;
  isActive: boolean;
  fromId: string;
  toId: string;
}

export type StepType = "COMPARISON" | "RECOLOR" | "ROTATION" | "DELETION" | "BALANCED";

export interface ActivityStep {
  id: string;
  operationId: string;
  operationName: string; // e.g. "INSERT(15)"
  description: string;
  nodes: RenderedNode[];
  edges: TreeEdge[];
  activeNodeIds: string[];
  activeEdgeIds: string[];
  type: StepType;
}

export interface OperationGroup {
  operationId: string;
  operationName: string;
  stepIndices: number[]; // indices into the flat steps array
}

export interface TreeStats {
  insertedValue: number | null;
  totalNodes: number;
  height: number;
  blackHeight: number;
}
