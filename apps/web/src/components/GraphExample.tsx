import {
  InMemoryContentGraph,
  type NodeRef,
  findRelation,
  nodeRef,
  otherEnd,
  refKey,
  sameRef,
  testClock,
} from '@flux/core';
import { Badge, Card, Section } from '@flux/ui';

/**
 * A worked example of the content graph, built and queried on every render by
 * the real kernel - not a diagram, and not a hardcoded list of answers.
 *
 * Phase 3 replaces this block with the actual feed. Until then it is the
 * clearest way to see what the platform is for: one video, and every direction
 * you can travel from it.
 */

/** Display names for the demo nodes. The real app resolves these from repositories. */
const NAMES: Record<string, string> = {
  'video:demo-video': 'Ju 288 C: why the grind is worth it',
  'creator:demo-creator': 'Vector Six',
  'community:demo-community': 'War Thunder / Germany / Aviation',
  'track:demo-track': 'Contrail (Slowed)',
  'product:demo-product': 'Throttle quadrant, 2-axis',
  'post:demo-post': 'Is the Ju 288 actually balanced?',
  'playlist:demo-playlist': 'Air RB, from zero',
  'live:demo-live': 'Grinding rank V, all night',
  'event:demo-event': 'Squadron night, Saturday',
  'tag:demo-tag': 'war-thunder',
};

const KIND_TONE = {
  community: 'accent',
  creator: 'accent',
  post: 'neutral',
  playlist: 'neutral',
  track: 'live',
  live: 'live',
  event: 'live',
  product: 'market',
  tag: 'neutral',
} as const;

async function buildExample() {
  // A fixed clock keeps the rendered order stable between requests.
  const graph = new InMemoryContentGraph({ clock: testClock() });

  const video = nodeRef('video', 'demo-video');
  const live = nodeRef('live', 'demo-live');

  await graph.connect({ from: video, kind: 'authored_by', to: nodeRef('creator', 'demo-creator') });
  await graph.connect({ from: video, kind: 'belongs_to', to: nodeRef('community', 'demo-community') });
  await graph.connect({ from: video, kind: 'features', to: nodeRef('track', 'demo-track') });
  await graph.connect({ from: video, kind: 'promotes', to: nodeRef('product', 'demo-product') });
  await graph.connect({ from: video, kind: 'derived_from', to: live });
  await graph.connect({ from: video, kind: 'tagged', to: nodeRef('tag', 'demo-tag') });
  await graph.connect({ from: nodeRef('post', 'demo-post'), kind: 'about', to: video });
  await graph.connect({
    from: nodeRef('playlist', 'demo-playlist'),
    kind: 'contains',
    to: video,
    position: 4,
  });
  await graph.connect({ from: live, kind: 'scheduled_as', to: nodeRef('event', 'demo-event') });

  const context = await graph.context(video);
  return { video, context };
}

function labelFor(
  edge: { from: NodeRef; kind: Parameters<typeof findRelation>[1]; to: NodeRef },
  self: NodeRef,
): string {
  const relation = findRelation(edge.from.kind, edge.kind, edge.to.kind);
  if (!relation) return edge.kind;
  // Walking an edge backwards reads with the inverse label.
  return sameRef(edge.from, self) ? relation.label : relation.inverseLabel;
}

export async function GraphExample() {
  const { video, context } = await buildExample();

  return (
    <Section
      title={`One video, ${context.total} ways out`}
      description="Computed live by @flux/core. Every row is an edge the relation contract allows; anything not in that contract cannot be written at all."
    >
      <Card className="flex flex-col gap-5">
        <div className="flex flex-col gap-1 border-b border-line pb-4">
          <span className="text-[11px] uppercase tracking-wider text-ink-faint">video</span>
          <span className="text-sm font-medium text-ink">{NAMES[refKey(video)]}</span>
        </div>

        <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {context.edges.map((edge) => {
            const far = otherEnd(edge, video);
            const tone = KIND_TONE[far.kind as keyof typeof KIND_TONE] ?? 'neutral';
            return (
              <li
                key={`${refKey(edge.from)}-${edge.kind}-${refKey(edge.to)}`}
                className="flex min-w-0 items-center gap-3"
              >
                <span className="w-20 shrink-0 text-right text-[11px] text-ink-faint sm:w-28">
                  {labelFor(edge, video)}
                </span>
                <Badge tone={tone}>{far.kind}</Badge>
                {/* min-w-0 is what actually lets a flex child shrink far enough to truncate. */}
                <span className="min-w-0 flex-1 truncate text-sm text-ink-muted">
                  {NAMES[refKey(far)]}
                </span>
              </li>
            );
          })}
        </ul>

        <p className="border-t border-line pt-4 text-xs text-ink-muted">
          {context.total} edges, {Object.keys(context.byKind).length} kinds of destination, from a
          single call to <code className="font-mono text-ink">graph.context(video)</code>.
        </p>
      </Card>
    </Section>
  );
}
