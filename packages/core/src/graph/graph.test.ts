import { beforeEach, describe, expect, it } from 'vitest';

import { testClock } from '../clock';
import { unwrap } from '../result';
import { InMemoryContentGraph, nodeRef, otherEnd, refKey } from './graph';
import { NODE_KINDS } from './kinds';
import { RELATIONS, isRelationAllowed, relationsFrom, relationsTo } from './relations';

const video = nodeRef('video', 'v1');
const creator = nodeRef('creator', 'c1');
const community = nodeRef('community', 'g1');
const track = nodeRef('track', 't1');
const product = nodeRef('product', 'p1');
const playlist = nodeRef('playlist', 'pl1');

describe('relation contract', () => {
  it('only names kinds that exist', () => {
    for (const relation of RELATIONS) {
      expect(NODE_KINDS).toContain(relation.from);
      expect(NODE_KINDS).toContain(relation.to);
    }
  });

  it('declares each triple once', () => {
    const keys = RELATIONS.map((r) => `${r.from}|${r.edge}|${r.to}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('expresses every link the product promises around a video', () => {
    // The connected-content claim, checked against the table rather than prose.
    expect(isRelationAllowed('video', 'belongs_to', 'community')).toBe(true);
    expect(isRelationAllowed('post', 'about', 'video')).toBe(true);
    expect(isRelationAllowed('playlist', 'contains', 'video')).toBe(true);
    expect(isRelationAllowed('video', 'features', 'track')).toBe(true);
    expect(isRelationAllowed('video', 'promotes', 'product')).toBe(true);
    expect(isRelationAllowed('video', 'authored_by', 'creator')).toBe(true);
    expect(isRelationAllowed('video', 'derived_from', 'live')).toBe(true);
    expect(isRelationAllowed('live', 'scheduled_as', 'event')).toBe(true);
  });

  it('refuses links the product does not mean', () => {
    expect(isRelationAllowed('product', 'replies_to', 'album')).toBe(false);
    expect(isRelationAllowed('community', 'authored_by', 'creator')).toBe(false);
  });

  it('answers both directions for the relation pickers', () => {
    expect(relationsFrom('video').map((r) => r.edge)).toContain('promotes');
    expect(relationsTo('tag').every((r) => r.edge === 'tagged')).toBe(true);
  });
});

describe('InMemoryContentGraph', () => {
  let graph: InMemoryContentGraph;

  beforeEach(() => {
    graph = new InMemoryContentGraph({ clock: testClock() });
  });

  it('connects a legal edge and finds it again', async () => {
    const edge = unwrap(await graph.connect({ from: video, kind: 'authored_by', to: creator }));
    expect(edge.createdAt).toBe('2026-01-01T00:00:00.000Z');

    const page = await graph.neighbors(video, { edge: 'authored_by' });
    expect(page.items).toHaveLength(1);
    expect(refKey(page.items[0]!.to)).toBe('creator:c1');
  });

  it('rejects an edge the relation table does not declare', async () => {
    const result = await graph.connect({ from: video, kind: 'replies_to', to: creator });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('invalid');
      expect(result.error.message).toMatch(/no "video replies_to creator" relation/);
    }
  });

  it('rejects self-links', async () => {
    const result = await graph.connect({ from: video, kind: 'derived_from', to: video });
    expect(result.ok).toBe(false);
  });

  it('is idempotent: connecting twice yields one edge', async () => {
    await graph.connect({ from: video, kind: 'tagged', to: nodeRef('tag', 'wt') });
    await graph.connect({ from: video, kind: 'tagged', to: nodeRef('tag', 'wt') });
    expect(graph.size).toBe(1);
  });

  it('enforces one-cardinality relations', async () => {
    await graph.connect({ from: video, kind: 'belongs_to', to: community });
    const second = await graph.connect({
      from: video,
      kind: 'belongs_to',
      to: nodeRef('community', 'g2'),
    });

    expect(second.ok).toBe(false);
    if (!second.ok) expect(second.error.code).toBe('conflict');
  });

  it('moves a one-cardinality edge when replacement is explicit', async () => {
    await graph.connect({ from: video, kind: 'belongs_to', to: community });
    const moved = await graph.connect({
      from: video,
      kind: 'belongs_to',
      to: nodeRef('community', 'g2'),
      replace: true,
    });

    expect(moved.ok).toBe(true);
    const parent = await graph.parent(video, 'belongs_to');
    expect(parent?.to.id).toBe('g2');
    expect(graph.size).toBe(1);
  });

  it('allows many-cardinality relations to stack up', async () => {
    await graph.connect({ from: video, kind: 'promotes', to: product });
    await graph.connect({ from: video, kind: 'promotes', to: nodeRef('product', 'p2') });

    const page = await graph.neighbors(video, { edge: 'promotes' });
    expect(page.items).toHaveLength(2);
  });

  it('walks edges backwards', async () => {
    await graph.connect({ from: video, kind: 'authored_by', to: creator });
    await graph.connect({ from: nodeRef('video', 'v2'), kind: 'authored_by', to: creator });

    const authored = await graph.neighbors(creator, { direction: 'in', edge: 'authored_by' });
    expect(authored.items.map((edge) => edge.from.id).sort()).toEqual(['v1', 'v2']);
  });

  it('filters by the kind on the far side', async () => {
    await graph.connect({ from: playlist, kind: 'contains', to: video, position: 1 });
    await graph.connect({ from: playlist, kind: 'contains', to: track, position: 2 });

    const onlyTracks = await graph.neighbors(playlist, { edge: 'contains', kind: 'track' });
    expect(onlyTracks.items).toHaveLength(1);
    expect(onlyTracks.items[0]!.to.kind).toBe('track');
  });

  it('orders an ordered container by position, not by recency', async () => {
    const clock = testClock();
    const ordered = new InMemoryContentGraph({ clock });
    // Added out of order on purpose: position must win over insertion time.
    await ordered.connect({ from: playlist, kind: 'contains', to: nodeRef('track', 'b'), position: 2 });
    clock.advance(1000);
    await ordered.connect({ from: playlist, kind: 'contains', to: nodeRef('track', 'a'), position: 1 });

    const page = await ordered.neighbors(playlist, { edge: 'contains', order: 'position' });
    expect(page.items.map((edge) => edge.to.id)).toEqual(['a', 'b']);
  });

  it('pages neighbours without repeating or dropping an edge', async () => {
    const clock = testClock();
    const many = new InMemoryContentGraph({ clock });
    for (let index = 0; index < 7; index++) {
      clock.advance(1000);
      await many.connect({ from: video, kind: 'tagged', to: nodeRef('tag', `t${index}`) });
    }

    const seen: string[] = [];
    let cursor: string | null = null;
    let guard = 0;
    do {
      const page = await many.neighbors(video, {
        edge: 'tagged',
        page: cursor ? { cursor, limit: 3 } : { limit: 3 },
      });
      seen.push(...page.items.map((edge) => edge.to.id));
      cursor = page.nextCursor;
    } while (cursor && ++guard < 10);

    expect(seen).toHaveLength(7);
    expect(new Set(seen).size).toBe(7);
  });

  it('disconnects a single edge and leaves the rest alone', async () => {
    await graph.connect({ from: video, kind: 'promotes', to: product });
    await graph.connect({ from: video, kind: 'authored_by', to: creator });

    expect(await graph.disconnect(video, 'promotes', product)).toBe(true);
    expect(await graph.disconnect(video, 'promotes', product)).toBe(false);
    expect(graph.size).toBe(1);
  });

  it('detaches a deleted node from both directions', async () => {
    await graph.connect({ from: video, kind: 'authored_by', to: creator });
    await graph.connect({ from: video, kind: 'belongs_to', to: community });
    await graph.connect({ from: playlist, kind: 'contains', to: video });

    expect(await graph.detach(video)).toBe(3);
    expect(graph.size).toBe(0);
    const orphaned = await graph.neighbors(playlist, { edge: 'contains' });
    expect(orphaned.items).toEqual([]);
  });

  it('gathers everything around a node in one call', async () => {
    await graph.connect({ from: video, kind: 'authored_by', to: creator });
    await graph.connect({ from: video, kind: 'belongs_to', to: community });
    await graph.connect({ from: video, kind: 'features', to: track });
    await graph.connect({ from: video, kind: 'promotes', to: product });
    await graph.connect({ from: playlist, kind: 'contains', to: video });
    await graph.connect({ from: nodeRef('post', 'po1'), kind: 'about', to: video });

    const context = await graph.context(video);

    expect(context.total).toBe(6);
    expect(Object.keys(context.byKind).sort()).toEqual([
      'community',
      'creator',
      'playlist',
      'post',
      'product',
      'track',
    ]);
    expect(context.byKind.playlist?.[0]?.id).toBe('pl1');
  });

  it('reports the far end relative to the node asked about', async () => {
    const edge = unwrap(await graph.connect({ from: video, kind: 'authored_by', to: creator }));
    expect(otherEnd(edge, video)).toEqual(creator);
    expect(otherEnd(edge, creator)).toEqual(video);
  });
});
