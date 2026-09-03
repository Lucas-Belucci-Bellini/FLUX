/**
 * The relation contract: every link the graph is allowed to hold.
 *
 * This table is the single place where FLUX declares what may connect to what.
 * `connect()` refuses anything not listed here, so an impossible edge - a
 * product "replying to" an album - fails at write time instead of turning up
 * as a broken card in a feed six months later.
 *
 * The labels are UI copy: a relation panel can render any edge in the graph
 * without knowing what it is looking at.
 */

import type { EdgeKind, NodeKind } from './kinds';

/**
 * `one` means a node may hold at most one outgoing edge of this kind:
 * a video sits in a single community, a comment answers a single parent.
 * `many` is the default shape.
 */
export type Cardinality = 'one' | 'many';

export interface RelationRule {
  readonly from: NodeKind;
  readonly edge: EdgeKind;
  readonly to: NodeKind;
  readonly cardinality: Cardinality;
  /** Read forwards: "this video _is posted in_ that community". */
  readonly label: string;
  /** Read backwards: that community's "videos". */
  readonly inverseLabel: string;
}

function rule(
  from: NodeKind,
  edge: EdgeKind,
  to: NodeKind,
  cardinality: Cardinality,
  label: string,
  inverseLabel: string,
): RelationRule {
  return { from, edge, to, cardinality, label, inverseLabel };
}

export const RELATIONS: readonly RelationRule[] = [
  // --- authorship -----------------------------------------------------------
  rule('video', 'authored_by', 'creator', 'one', 'by', 'videos'),
  rule('short', 'authored_by', 'creator', 'one', 'by', 'shorts'),
  rule('live', 'authored_by', 'creator', 'one', 'hosted by', 'lives'),
  rule('post', 'authored_by', 'user', 'one', 'posted by', 'posts'),
  rule('comment', 'authored_by', 'user', 'one', 'written by', 'comments'),
  rule('playlist', 'authored_by', 'user', 'one', 'curated by', 'playlists'),
  rule('creator', 'authored_by', 'user', 'one', 'run by', 'creator profile'),
  rule('store', 'authored_by', 'creator', 'one', 'run by', 'store'),
  rule('event', 'authored_by', 'user', 'one', 'organised by', 'events'),

  // --- containment ----------------------------------------------------------
  rule('video', 'belongs_to', 'community', 'one', 'posted in', 'videos'),
  rule('short', 'belongs_to', 'community', 'one', 'posted in', 'shorts'),
  rule('post', 'belongs_to', 'channel', 'one', 'posted in', 'posts'),
  rule('channel', 'belongs_to', 'community', 'one', 'channel of', 'channels'),
  rule('community', 'belongs_to', 'community', 'one', 'part of', 'subcommunities'),
  rule('track', 'belongs_to', 'album', 'one', 'from', 'tracks'),
  rule('event', 'belongs_to', 'community', 'one', 'hosted by', 'events'),
  rule('product', 'belongs_to', 'store', 'one', 'sold in', 'products'),

  // --- ordered collections --------------------------------------------------
  rule('playlist', 'contains', 'video', 'many', 'includes', 'in playlists'),
  rule('playlist', 'contains', 'track', 'many', 'includes', 'in playlists'),
  rule('album', 'contains', 'track', 'many', 'includes', 'on albums'),

  // --- creative credit ------------------------------------------------------
  rule('video', 'features', 'track', 'many', 'features', 'featured in videos'),
  rule('video', 'features', 'artist', 'many', 'features', 'appears in videos'),
  rule('short', 'features', 'track', 'many', 'sound', 'used by shorts'),
  rule('live', 'features', 'artist', 'many', 'featuring', 'live appearances'),
  rule('track', 'performed_by', 'artist', 'many', 'by', 'tracks'),
  rule('album', 'performed_by', 'artist', 'many', 'by', 'albums'),

  // --- discussion -----------------------------------------------------------
  rule('post', 'about', 'video', 'one', 'discussing', 'discussions'),
  rule('post', 'about', 'live', 'one', 'discussing', 'discussions'),
  rule('post', 'about', 'track', 'one', 'discussing', 'discussions'),
  rule('post', 'about', 'product', 'one', 'discussing', 'discussions'),
  rule('post', 'about', 'event', 'one', 'discussing', 'discussions'),
  rule('comment', 'about', 'video', 'one', 'on', 'comments'),
  rule('comment', 'about', 'short', 'one', 'on', 'comments'),
  rule('comment', 'about', 'post', 'one', 'on', 'comments'),
  rule('comment', 'about', 'live', 'one', 'on', 'comments'),
  rule('comment', 'about', 'track', 'one', 'on', 'comments'),
  rule('comment', 'about', 'product', 'one', 'on', 'comments'),
  rule('comment', 'replies_to', 'comment', 'one', 'replying to', 'replies'),

  // --- commerce -------------------------------------------------------------
  rule('store', 'sells', 'product', 'many', 'sells', 'sold by'),
  rule('video', 'promotes', 'product', 'many', 'featured products', 'seen in videos'),
  rule('short', 'promotes', 'product', 'many', 'featured products', 'seen in shorts'),
  rule('live', 'promotes', 'product', 'many', 'shopping', 'sold on live'),
  rule('post', 'promotes', 'product', 'many', 'featured products', 'mentioned in posts'),

  // --- scheduling and provenance -------------------------------------------
  rule('live', 'scheduled_as', 'event', 'one', 'scheduled as', 'live'),
  rule('short', 'derived_from', 'video', 'one', 'clipped from', 'clips'),
  rule('video', 'derived_from', 'live', 'one', 'recorded from', 'replays'),

  // --- topics ---------------------------------------------------------------
  rule('video', 'tagged', 'tag', 'many', 'tagged', 'videos'),
  rule('short', 'tagged', 'tag', 'many', 'tagged', 'shorts'),
  rule('post', 'tagged', 'tag', 'many', 'tagged', 'posts'),
  rule('live', 'tagged', 'tag', 'many', 'tagged', 'lives'),
  rule('track', 'tagged', 'tag', 'many', 'tagged', 'tracks'),
  rule('product', 'tagged', 'tag', 'many', 'tagged', 'products'),
  rule('community', 'tagged', 'tag', 'many', 'tagged', 'communities'),
];

const RELATION_INDEX = new Map<string, RelationRule>(
  RELATIONS.map((relation) => [`${relation.from}|${relation.edge}|${relation.to}`, relation]),
);

export function findRelation(
  from: NodeKind,
  edge: EdgeKind,
  to: NodeKind,
): RelationRule | undefined {
  return RELATION_INDEX.get(`${from}|${edge}|${to}`);
}

export function isRelationAllowed(from: NodeKind, edge: EdgeKind, to: NodeKind): boolean {
  return RELATION_INDEX.has(`${from}|${edge}|${to}`);
}

/** Everything a node of this kind can point at. Drives "add a link" pickers. */
export function relationsFrom(from: NodeKind): readonly RelationRule[] {
  return RELATIONS.filter((relation) => relation.from === from);
}

/** Everything that can point at a node of this kind. Drives the relations panel. */
export function relationsTo(to: NodeKind): readonly RelationRule[] {
  return RELATIONS.filter((relation) => relation.to === to);
}
