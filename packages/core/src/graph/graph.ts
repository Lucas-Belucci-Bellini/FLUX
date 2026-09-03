/**
 * The content graph itself.
 *
 * `ContentGraph` is the port every part of FLUX talks to; `InMemoryContentGraph`
 * is the adapter that lets the app boot with no database. The PostgreSQL
 * adapter implements the same interface against an `edges` table, so nothing
 * above this file changes when persistence arrives.
 */

import { ConflictError, type FluxError, InvalidInputError } from '../errors';
import { type Clock, systemClock } from '../clock';
import {
  DEFAULT_PAGE_SIZE,
  type Page,
  type PageRequest,
  emptyPage,
  paginate,
} from '../pagination';
import { type Result, err, ok } from '../result';
import type { Direction, EdgeKind, NodeKind } from './kinds';
import { findRelation, isRelationAllowed } from './relations';

/** A pointer to something in the graph. Kind plus id, never an id alone. */
export interface NodeRef {
  readonly kind: NodeKind;
  readonly id: string;
}

export function nodeRef(kind: NodeKind, id: string): NodeRef {
  return { kind, id };
}

export function refKey(ref: NodeRef): string {
  return `${ref.kind}:${ref.id}`;
}

export function sameRef(a: NodeRef, b: NodeRef): boolean {
  return a.kind === b.kind && a.id === b.id;
}

export interface GraphEdge {
  readonly from: NodeRef;
  readonly kind: EdgeKind;
  readonly to: NodeRef;
  readonly createdAt: string;
  /** Position inside an ordered container, for `contains` edges. */
  readonly position?: number;
}

export interface ConnectInput {
  readonly from: NodeRef;
  readonly kind: EdgeKind;
  readonly to: NodeRef;
  readonly position?: number;
  /**
   * For `one`-cardinality relations: replace the existing edge instead of
   * failing. Moving a video to another community is a replace; accidentally
   * filing it in two communities is a conflict.
   */
  readonly replace?: boolean;
}

export type EdgeOrder = 'recent' | 'position';

export interface NeighborQuery {
  readonly edge?: EdgeKind | readonly EdgeKind[];
  /** Default `out`: edges this node declares. */
  readonly direction?: Direction;
  /** Filter the far side of the edge. */
  readonly kind?: NodeKind | readonly NodeKind[];
  readonly order?: EdgeOrder;
  readonly page?: PageRequest;
}

/**
 * Everything attached to one node, grouped for display.
 *
 * This is the shape behind the "connected" panel: open a video and the
 * community, the discussion, the playlist, the track, the products and the
 * creator are all one call away.
 */
export interface GraphContext {
  readonly ref: NodeRef;
  readonly edges: readonly GraphEdge[];
  /** Far-side nodes grouped by their kind. */
  readonly byKind: Readonly<Partial<Record<NodeKind, readonly NodeRef[]>>>;
  readonly total: number;
}

export interface ContentGraph {
  connect(input: ConnectInput): Promise<Result<GraphEdge, FluxError>>;
  disconnect(from: NodeRef, kind: EdgeKind, to: NodeRef): Promise<boolean>;
  /** Remove every edge touching a node. Called when the node is deleted. */
  detach(ref: NodeRef): Promise<number>;
  neighbors(ref: NodeRef, query?: NeighborQuery): Promise<Page<GraphEdge>>;
  /** The single outgoing edge of a `one`-cardinality relation, if present. */
  parent(ref: NodeRef, kind: EdgeKind): Promise<GraphEdge | null>;
  context(ref: NodeRef, options?: { direction?: Direction; limit?: number }): Promise<GraphContext>;
}

function toArray<T>(value: T | readonly T[] | undefined): readonly T[] | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? (value as readonly T[]) : ([value] as readonly T[]);
}

function edgeKey(edge: Pick<GraphEdge, 'from' | 'kind' | 'to'>): string {
  return `${refKey(edge.from)}|${edge.kind}|${refKey(edge.to)}`;
}

/** The far side of an edge relative to the node being queried. */
export function otherEnd(edge: GraphEdge, self: NodeRef): NodeRef {
  return sameRef(edge.from, self) ? edge.to : edge.from;
}

export class InMemoryContentGraph implements ContentGraph {
  readonly #edges = new Map<string, GraphEdge>();
  readonly #outgoing = new Map<string, Set<string>>();
  readonly #incoming = new Map<string, Set<string>>();
  readonly #clock: Clock;

  constructor(options: { clock?: Clock } = {}) {
    this.#clock = options.clock ?? systemClock;
  }

  async connect(input: ConnectInput): Promise<Result<GraphEdge, FluxError>> {
    const { from, kind, to } = input;

    if (sameRef(from, to)) {
      return err(new InvalidInputError('A node cannot link to itself.', { kind }));
    }

    const relation = findRelation(from.kind, kind, to.kind);
    if (!relation) {
      return err(
        new InvalidInputError(
          `The graph has no "${from.kind} ${kind} ${to.kind}" relation.`,
          { from: from.kind, edge: kind, to: to.kind },
        ),
      );
    }

    const key = edgeKey(input);
    const existing = this.#edges.get(key);
    // Connecting twice is a no-op, not an error: retries and double clicks
    // must not produce duplicate edges.
    if (existing) return ok(existing);

    if (relation.cardinality === 'one') {
      const current = await this.parent(from, kind);
      if (current) {
        if (!input.replace) {
          return err(
            new ConflictError(
              `This ${from.kind} is already linked to a ${current.to.kind} by "${kind}".`,
              { existing: refKey(current.to) },
            ),
          );
        }
        await this.disconnect(current.from, current.kind, current.to);
      }
    }

    const edge: GraphEdge = {
      from,
      kind,
      to,
      createdAt: this.#clock.timestamp(),
      ...(input.position === undefined ? {} : { position: input.position }),
    };

    this.#edges.set(key, edge);
    this.#index(this.#outgoing, refKey(from), key);
    this.#index(this.#incoming, refKey(to), key);
    return ok(edge);
  }

  async disconnect(from: NodeRef, kind: EdgeKind, to: NodeRef): Promise<boolean> {
    const key = edgeKey({ from, kind, to });
    if (!this.#edges.delete(key)) return false;
    this.#outgoing.get(refKey(from))?.delete(key);
    this.#incoming.get(refKey(to))?.delete(key);
    return true;
  }

  async detach(ref: NodeRef): Promise<number> {
    const key = refKey(ref);
    const keys = new Set([...(this.#outgoing.get(key) ?? []), ...(this.#incoming.get(key) ?? [])]);
    for (const edgeId of keys) {
      const edge = this.#edges.get(edgeId);
      if (!edge) continue;
      this.#edges.delete(edgeId);
      this.#outgoing.get(refKey(edge.from))?.delete(edgeId);
      this.#incoming.get(refKey(edge.to))?.delete(edgeId);
    }
    this.#outgoing.delete(key);
    this.#incoming.delete(key);
    return keys.size;
  }

  async neighbors(ref: NodeRef, query: NeighborQuery = {}): Promise<Page<GraphEdge>> {
    const matches = this.#collect(ref, query);
    if (matches.length === 0) return emptyPage<GraphEdge>();

    const order = query.order ?? 'recent';
    const sorted = [...matches].sort((a, b) => {
      if (order === 'position') {
        const left = a.position ?? Number.MAX_SAFE_INTEGER;
        const right = b.position ?? Number.MAX_SAFE_INTEGER;
        if (left !== right) return left - right;
      }
      // Newest first; the edge key breaks ties so paging is deterministic.
      const byTime = b.createdAt.localeCompare(a.createdAt);
      return byTime !== 0 ? byTime : edgeKey(a).localeCompare(edgeKey(b));
    });

    const page: PageRequest = query.page ?? { limit: DEFAULT_PAGE_SIZE };
    return paginate(sorted, page, (edge) => ({
      key: order === 'position' ? String(edge.position ?? '') : edge.createdAt,
      id: edgeKey(edge),
    }));
  }

  async parent(ref: NodeRef, kind: EdgeKind): Promise<GraphEdge | null> {
    for (const key of this.#outgoing.get(refKey(ref)) ?? []) {
      const edge = this.#edges.get(key);
      if (edge?.kind === kind) return edge;
    }
    return null;
  }

  async context(
    ref: NodeRef,
    options: { direction?: Direction; limit?: number } = {},
  ): Promise<GraphContext> {
    const edges = this.#collect(ref, { direction: options.direction ?? 'both' });
    const limit = options.limit ?? 200;
    const trimmed = edges
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);

    const byKind: Partial<Record<NodeKind, NodeRef[]>> = {};
    for (const edge of trimmed) {
      const far = otherEnd(edge, ref);
      const bucket = (byKind[far.kind] ??= []);
      if (!bucket.some((candidate) => sameRef(candidate, far))) bucket.push(far);
    }

    return { ref, edges: trimmed, byKind, total: edges.length };
  }

  /** Every edge currently held. Diagnostics and the dev graph inspector. */
  all(): readonly GraphEdge[] {
    return [...this.#edges.values()];
  }

  get size(): number {
    return this.#edges.size;
  }

  #index(index: Map<string, Set<string>>, node: string, edge: string): void {
    const set = index.get(node) ?? new Set<string>();
    set.add(edge);
    index.set(node, set);
  }

  #collect(ref: NodeRef, query: NeighborQuery): GraphEdge[] {
    const direction = query.direction ?? 'out';
    const key = refKey(ref);
    const keys = new Set<string>();
    if (direction === 'out' || direction === 'both') {
      for (const edge of this.#outgoing.get(key) ?? []) keys.add(edge);
    }
    if (direction === 'in' || direction === 'both') {
      for (const edge of this.#incoming.get(key) ?? []) keys.add(edge);
    }

    const edgeKinds = toArray(query.edge);
    const nodeKinds = toArray(query.kind);
    const matches: GraphEdge[] = [];

    for (const edgeId of keys) {
      const edge = this.#edges.get(edgeId);
      if (!edge) continue;
      if (edgeKinds && !edgeKinds.includes(edge.kind)) continue;
      if (nodeKinds && !nodeKinds.includes(otherEnd(edge, ref).kind)) continue;
      matches.push(edge);
    }
    return matches;
  }
}

/**
 * Guard for callers that only want to know whether a link is legal - the
 * "connect this video to…" picker, for instance - without building an edge.
 */
export function canConnect(from: NodeKind, kind: EdgeKind, to: NodeKind): boolean {
  return isRelationAllowed(from, kind, to);
}
