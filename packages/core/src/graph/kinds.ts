/**
 * The vocabulary of the content graph.
 *
 * These two lists are deliberately closed. A new kind of thing, or a new way
 * for two things to relate, is a decision that gets made here and nowhere
 * else - which is what stops "everything connects to everything" from
 * degrading into an untyped soup nobody can query.
 */

export const NODE_KINDS = [
  'user',
  'creator',
  'video',
  'short',
  'live',
  'post',
  'comment',
  'community',
  'channel',
  'playlist',
  'track',
  'album',
  'artist',
  'store',
  'product',
  'event',
  'tag',
] as const;

export type NodeKind = (typeof NODE_KINDS)[number];

export function isNodeKind(value: unknown): value is NodeKind {
  return typeof value === 'string' && (NODE_KINDS as readonly string[]).includes(value);
}

export const EDGE_KINDS = [
  /** Who made it. Content to its creator or author. */
  'authored_by',
  /** Where it lives. A video in a community, a channel in a community, a track on an album. */
  'belongs_to',
  /** Ordered membership. A playlist holding videos or tracks. */
  'contains',
  /** Creative credit. A video featuring a track, a live featuring an artist. */
  'features',
  /** Discussion. A post or comment aimed at a piece of content. */
  'about',
  /** A comment answering another comment. */
  'replies_to',
  /** Commerce. A store offering a product. */
  'sells',
  /** Content pointing at something for sale - the product shelf under a video. */
  'promotes',
  /** Topic labelling, the loosest link in the graph. */
  'tagged',
  /** A live session planned as a calendar event. */
  'scheduled_as',
  /** Provenance. A short cut from a video, a video recorded from a live. */
  'derived_from',
  /** Performance credit. A track or album by an artist. */
  'performed_by',
] as const;

export type EdgeKind = (typeof EDGE_KINDS)[number];

export function isEdgeKind(value: unknown): value is EdgeKind {
  return typeof value === 'string' && (EDGE_KINDS as readonly string[]).includes(value);
}

/** Which way an edge is being walked. */
export type Direction = 'out' | 'in' | 'both';
