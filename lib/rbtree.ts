import { ActivityStep, RenderedNode, TreeEdge, NodeColor, StepType } from "@/types/tree";
import { computeLayout, LayoutNode } from "@/lib/layout";

export interface INode {
  id: string;
  value: number;
  color: NodeColor;
  left: INode | null;
  right: INode | null;
  parent: INode | null;
}

function colorOf(n: INode | null): NodeColor {
  return n ? n.color : "BLACK";
}

let idCounter = 0;
function nextId(): string {
  idCounter += 1;
  return `n${idCounter}`;
}

export class RedBlackTree {
  root: INode | null = null;

  // ---------- public API ----------

  insert(value: number): ActivityStep[] {
    const opId = `op-${nextId()}`;
    const opName = `INSERT(${value})`;
    const steps: ActivityStep[] = [];

    if (this.findNode(value)) {
      steps.push(
        this.snapshot(opId, opName, `Value ${value} already exists in the tree — skipped.`, [], [], "BALANCED")
      );
      return steps;
    }

    // 1. BST walk
    let parent: INode | null = null;
    let current = this.root;
    while (current) {
      steps.push(
        this.snapshot(
          opId,
          opName,
          `Compare ${value} with ${current.value} → go ${value < current.value ? "left" : "right"}.`,
          [current.id],
          [],
          "COMPARISON"
        )
      );
      parent = current;
      current = value < current.value ? current.left : current.right;
    }

    const z: INode = { id: nextId(), value, color: "RED", left: null, right: null, parent };
    if (!parent) {
      this.root = z;
    } else if (value < parent.value) {
      parent.left = z;
    } else {
      parent.right = z;
    }

    steps.push(
      this.snapshot(
        opId,
        opName,
        `Insert ${value} as a new RED leaf${parent ? ` under ${parent.value}` : ""}.`,
        [z.id],
        parent ? [this.edgeId(parent.id, z.id)] : [],
        "COMPARISON"
      )
    );

    this.insertFixup(z, opId, opName, steps);

    if (this.root) this.root.color = "BLACK";
    steps.push(this.snapshot(opId, opName, `Tree is balanced. Root is BLACK.`, this.root ? [this.root.id] : [], [], "BALANCED"));

    return steps;
  }

  delete(value: number): ActivityStep[] {
    const opId = `op-${nextId()}`;
    const opName = `DELETE(${value})`;
    const steps: ActivityStep[] = [];

    let z = this.root;
    while (z && z.value !== value) {
      steps.push(
        this.snapshot(
          opId,
          opName,
          `Compare ${value} with ${z.value} → go ${value < z.value ? "left" : "right"}.`,
          [z.id],
          [],
          "COMPARISON"
        )
      );
      z = value < z.value ? z.left : z.right;
    }

    if (!z) {
      steps.push(this.snapshot(opId, opName, `Value ${value} was not found in the tree.`, [], [], "BALANCED"));
      return steps;
    }

    steps.push(this.snapshot(opId, opName, `Found node ${value} to delete.`, [z.id], [], "COMPARISON"));

    let y = z;
    let yOriginalColor = y.color;
    let x: INode | null;
    let xParent: INode | null;

    if (!z.left) {
      x = z.right;
      xParent = z.parent;
      this.transplant(z, z.right);
    } else if (!z.right) {
      x = z.left;
      xParent = z.parent;
      this.transplant(z, z.left);
    } else {
      y = this.treeMinimum(z.right);
      yOriginalColor = y.color;
      x = y.right;
      if (y.parent === z) {
        xParent = y;
      } else {
        xParent = y.parent;
        this.transplant(y, y.right);
        y.right = z.right;
        if (y.right) y.right.parent = y;
      }
      this.transplant(z, y);
      y.left = z.left;
      if (y.left) y.left.parent = y;
      y.color = z.color;

      steps.push(
        this.snapshot(
          opId,
          opName,
          `${value} has two children — replace it with its in-order successor ${y.value}.`,
          [y.id],
          [],
          "COMPARISON"
        )
      );
    }

    steps.push(this.snapshot(opId, opName, `Removed node ${value} from the tree.`, x ? [x.id] : [], [], "COMPARISON"));

    if (yOriginalColor === "BLACK") {
      this.deleteFixup(x, xParent, opId, opName, steps);
    }

    if (this.root) this.root.color = "BLACK";
    steps.push(this.snapshot(opId, opName, `Tree is balanced. Root is BLACK.`, this.root ? [this.root.id] : [], [], "BALANCED"));

    return steps;
  }

  reset() {
    this.root = null;
  }

  // ---------- internals ----------

  private findNode(value: number): INode | null {
    let n = this.root;
    while (n) {
      if (value === n.value) return n;
      n = value < n.value ? n.left : n.right;
    }
    return null;
  }

  private treeMinimum(n: INode): INode {
    while (n.left) n = n.left;
    return n;
  }

  private transplant(u: INode, v: INode | null) {
    if (!u.parent) this.root = v;
    else if (u === u.parent.left) u.parent.left = v;
    else u.parent.right = v;
    if (v) v.parent = u.parent;
  }

  private leftRotate(x: INode) {
    const y = x.right!;
    x.right = y.left;
    if (y.left) y.left.parent = x;
    y.parent = x.parent;
    if (!x.parent) this.root = y;
    else if (x === x.parent.left) x.parent.left = y;
    else x.parent.right = y;
    y.left = x;
    x.parent = y;
  }

  private rightRotate(x: INode) {
    const y = x.left!;
    x.left = y.right;
    if (y.right) y.right.parent = x;
    y.parent = x.parent;
    if (!x.parent) this.root = y;
    else if (x === x.parent.right) x.parent.right = y;
    else x.parent.left = y;
    y.right = x;
    x.parent = y;
  }

  private insertFixup(z0: INode, opId: string, opName: string, steps: ActivityStep[]) {
    let z = z0;
    while (z.parent && z.parent.color === "RED") {
      const parent = z.parent;
      const grandparent = parent.parent!;
      if (parent === grandparent.left) {
        const uncle = grandparent.right;
        steps.push(
          this.snapshot(
            opId,
            opName,
            `${parent.value} is RED — check uncle of ${z.value} (${uncle ? uncle.value : "NIL"}).`,
            [z.id, parent.id, ...(uncle ? [uncle.id] : [])],
            [],
            "COMPARISON"
          )
        );
        if (colorOf(uncle) === "RED") {
          parent.color = "BLACK";
          uncle!.color = "BLACK";
          grandparent.color = "RED";
          steps.push(
            this.snapshot(
              opId,
              opName,
              `Uncle is RED — recolor parent ${parent.value} and uncle ${uncle!.value} to BLACK, grandparent ${grandparent.value} to RED.`,
              [parent.id, uncle!.id, grandparent.id],
              [],
              "RECOLOR"
            )
          );
          z = grandparent;
        } else {
          if (z === parent.right) {
            z = parent;
            steps.push(
              this.snapshot(
                opId,
                opName,
                `Uncle is BLACK, ${z.value} is a right child — left-rotate around ${z.value}.`,
                [z.id],
                [this.edgeId(z.parent!.id, z.id)],
                "ROTATION"
              )
            );
            this.leftRotate(z);
          }
          const p = z.parent!;
          const g = p.parent!;
          p.color = "BLACK";
          g.color = "RED";
          steps.push(
            this.snapshot(
              opId,
              opName,
              `Right-rotate around ${g.value} and recolor ${p.value} BLACK, ${g.value} RED.`,
              [p.id, g.id],
              [this.edgeId(g.id, p.id)],
              "ROTATION"
            )
          );
          this.rightRotate(g);
        }
      } else {
        const uncle = grandparent.left;
        steps.push(
          this.snapshot(
            opId,
            opName,
            `${parent.value} is RED — check uncle of ${z.value} (${uncle ? uncle.value : "NIL"}).`,
            [z.id, parent.id, ...(uncle ? [uncle.id] : [])],
            [],
            "COMPARISON"
          )
        );
        if (colorOf(uncle) === "RED") {
          parent.color = "BLACK";
          uncle!.color = "BLACK";
          grandparent.color = "RED";
          steps.push(
            this.snapshot(
              opId,
              opName,
              `Uncle is RED — recolor parent ${parent.value} and uncle ${uncle!.value} to BLACK, grandparent ${grandparent.value} to RED.`,
              [parent.id, uncle!.id, grandparent.id],
              [],
              "RECOLOR"
            )
          );
          z = grandparent;
        } else {
          if (z === parent.left) {
            z = parent;
            steps.push(
              this.snapshot(
                opId,
                opName,
                `Uncle is BLACK, ${z.value} is a left child — right-rotate around ${z.value}.`,
                [z.id],
                [this.edgeId(z.parent!.id, z.id)],
                "ROTATION"
              )
            );
            this.rightRotate(z);
          }
          const p = z.parent!;
          const g = p.parent!;
          p.color = "BLACK";
          g.color = "RED";
          steps.push(
            this.snapshot(
              opId,
              opName,
              `Left-rotate around ${g.value} and recolor ${p.value} BLACK, ${g.value} RED.`,
              [p.id, g.id],
              [this.edgeId(g.id, p.id)],
              "ROTATION"
            )
          );
          this.leftRotate(g);
        }
      }
    }
  }

  private deleteFixup(x0: INode | null, xParent0: INode | null, opId: string, opName: string, steps: ActivityStep[]) {
    let x = x0;
    let xParent = xParent0;

    while (x !== this.root && colorOf(x) === "BLACK") {
      if (!xParent) break;
      if (x === xParent.left) {
        let sibling = xParent.right;
        if (!sibling) break;
        if (sibling.color === "RED") {
          sibling.color = "BLACK";
          xParent.color = "RED";
          steps.push(
            this.snapshot(
              opId,
              opName,
              `Sibling ${sibling.value} is RED — recolor and left-rotate around ${xParent.value}.`,
              [sibling.id, xParent.id],
              [this.edgeId(xParent.id, sibling.id)],
              "ROTATION"
            )
          );
          this.leftRotate(xParent);
          sibling = xParent.right;
          if (!sibling) break;
        }
        steps.push(
          this.snapshot(
            opId,
            opName,
            `Double-black at ${x ? x.value : "NIL"} — examine sibling ${sibling.value}.`,
            [xParent.id, sibling.id],
            [],
            "COMPARISON"
          )
        );
        if (colorOf(sibling.left) === "BLACK" && colorOf(sibling.right) === "BLACK") {
          sibling.color = "RED";
          steps.push(
            this.snapshot(opId, opName, `Sibling's children are BLACK — recolor sibling ${sibling.value} RED.`, [sibling.id], [], "RECOLOR")
          );
          x = xParent;
          xParent = x.parent;
        } else {
          if (colorOf(sibling.right) === "BLACK") {
            if (sibling.left) sibling.left.color = "BLACK";
            sibling.color = "RED";
            steps.push(
              this.snapshot(
                opId,
                opName,
                `Sibling's near child is RED — recolor and right-rotate around ${sibling.value}.`,
                [sibling.id],
                [this.edgeId(sibling.id, sibling.left ? sibling.left.id : sibling.id)],
                "ROTATION"
              )
            );
            this.rightRotate(sibling);
            sibling = xParent.right!;
          }
          sibling.color = xParent.color;
          xParent.color = "BLACK";
          if (sibling.right) sibling.right.color = "BLACK";
          steps.push(
            this.snapshot(
              opId,
              opName,
              `Recolor and left-rotate around ${xParent.value} to resolve the double-black.`,
              [xParent.id, sibling.id],
              [this.edgeId(xParent.id, sibling.id)],
              "ROTATION"
            )
          );
          this.leftRotate(xParent);
          x = this.root;
          xParent = null;
        }
      } else {
        let sibling = xParent.left;
        if (!sibling) break;
        if (sibling.color === "RED") {
          sibling.color = "BLACK";
          xParent.color = "RED";
          steps.push(
            this.snapshot(
              opId,
              opName,
              `Sibling ${sibling.value} is RED — recolor and right-rotate around ${xParent.value}.`,
              [sibling.id, xParent.id],
              [this.edgeId(xParent.id, sibling.id)],
              "ROTATION"
            )
          );
          this.rightRotate(xParent);
          sibling = xParent.left;
          if (!sibling) break;
        }
        steps.push(
          this.snapshot(
            opId,
            opName,
            `Double-black at ${x ? x.value : "NIL"} — examine sibling ${sibling.value}.`,
            [xParent.id, sibling.id],
            [],
            "COMPARISON"
          )
        );
        if (colorOf(sibling.right) === "BLACK" && colorOf(sibling.left) === "BLACK") {
          sibling.color = "RED";
          steps.push(
            this.snapshot(opId, opName, `Sibling's children are BLACK — recolor sibling ${sibling.value} RED.`, [sibling.id], [], "RECOLOR")
          );
          x = xParent;
          xParent = x.parent;
        } else {
          if (colorOf(sibling.left) === "BLACK") {
            if (sibling.right) sibling.right.color = "BLACK";
            sibling.color = "RED";
            steps.push(
              this.snapshot(
                opId,
                opName,
                `Sibling's near child is RED — recolor and left-rotate around ${sibling.value}.`,
                [sibling.id],
                [this.edgeId(sibling.id, sibling.right ? sibling.right.id : sibling.id)],
                "ROTATION"
              )
            );
            this.leftRotate(sibling);
            sibling = xParent.left!;
          }
          sibling.color = xParent.color;
          xParent.color = "BLACK";
          if (sibling.left) sibling.left.color = "BLACK";
          steps.push(
            this.snapshot(
              opId,
              opName,
              `Recolor and right-rotate around ${xParent.value} to resolve the double-black.`,
              [xParent.id, sibling.id],
              [this.edgeId(xParent.id, sibling.id)],
              "ROTATION"
            )
          );
          this.rightRotate(xParent);
          x = this.root;
          xParent = null;
        }
      }
    }
    if (x) x.color = "BLACK";
  }

  // ---------- snapshotting ----------

  private edgeId(fromId: string, toId: string): string {
    return `edge-${fromId}-${toId}`;
  }

  private toLayoutNode(n: INode | null): LayoutNode | null {
    if (!n) return null;
    return {
      id: n.id,
      left: this.toLayoutNode(n.left),
      right: this.toLayoutNode(n.right),
    };
  }

  private snapshot(
    opId: string,
    opName: string,
    description: string,
    activeNodeIds: string[],
    activeEdgeIds: string[],
    type: StepType
  ): ActivityStep {
    const positions = computeLayout(this.toLayoutNode(this.root));
    const nodes: RenderedNode[] = [];
    const edges: TreeEdge[] = [];

    const walk = (n: INode | null) => {
      if (!n) return;
      const pos = positions.get(n.id)!;
      nodes.push({
        id: n.id,
        value: n.value,
        color: n.color,
        position: pos,
        parentId: n.parent?.id,
        leftId: n.left?.id,
        rightId: n.right?.id,
      });
      if (n.left) {
        const childPos = positions.get(n.left.id)!;
        const id = this.edgeId(n.id, n.left.id);
        edges.push({ id, from: pos, to: childPos, isActive: activeEdgeIds.includes(id), fromId: n.id, toId: n.left.id });
      }
      if (n.right) {
        const childPos = positions.get(n.right.id)!;
        const id = this.edgeId(n.id, n.right.id);
        edges.push({ id, from: pos, to: childPos, isActive: activeEdgeIds.includes(id), fromId: n.id, toId: n.right.id });
      }
      walk(n.left);
      walk(n.right);
    };
    walk(this.root);

    return {
      id: `step-${nextId()}`,
      operationId: opId,
      operationName: opName,
      description,
      nodes,
      edges,
      activeNodeIds,
      activeEdgeIds,
      type,
    };
  }
}

export function computeTreeHeight(nodes: RenderedNode[]): number {
  if (nodes.length === 0) return 0;
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const root = nodes.find((n) => !n.parentId);
  if (!root) return 0;
  const depth = (n: RenderedNode): number => {
    const l = n.leftId ? byId.get(n.leftId) : undefined;
    const r = n.rightId ? byId.get(n.rightId) : undefined;
    return 1 + Math.max(l ? depth(l) : 0, r ? depth(r) : 0);
  };
  return depth(root);
}

export function computeBlackHeight(nodes: RenderedNode[]): number {
  if (nodes.length === 0) return 0;
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const root = nodes.find((n) => !n.parentId);
  if (!root) return 0;
  // black height counted down the left spine, not counting the root itself
  let bh = 0;
  let n: RenderedNode | undefined = byId.get(root.leftId ?? "");
  while (n) {
    if (n.color === "BLACK") bh += 1;
    n = n.leftId ? byId.get(n.leftId) : undefined;
  }
  return bh;
}

