import { NODE_KINDS, RELATIONS } from '@flux/core';
import { Badge, Card, Section } from '@flux/ui';

import { Icon } from '@/components/Icon';
import { GraphExample } from '@/components/GraphExample';
import { PHASES, currentPhase } from '@/lib/roadmap';

/**
 * Home, during phase 0.
 *
 * The feed that eventually lives here needs videos (phase 2) and a discovery
 * layer (phase 3). Until those exist, this page shows what has actually been
 * built - and the content graph running for real, not a picture of one.
 */
export default function HomePage() {
  const done = PHASES.filter((phase) => phase.status === 'done').length;

  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-5 pt-2">
        <Badge tone="accent" className="self-start">
          Phase {currentPhase.number} &middot; {currentPhase.title.toLowerCase()}
        </Badge>
        <h1 className="max-w-3xl text-3xl font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-4xl">
          Everything you watch is connected to somewhere you can go next.
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-ink-muted">
          FLUX puts video, communities, music, live and a marketplace on a single content graph.
          A video is never a dead end: it belongs to a community, features a track, carries a
          product shelf, and has a discussion attached. You never have to leave to find the rest
          of it.
        </p>
        <dl className="flex flex-wrap gap-x-8 gap-y-3 pt-1">
          <Stat label="Phases complete" value={`${done} / ${PHASES.length}`} />
          <Stat label="Node kinds" value={String(NODE_KINDS.length)} />
          <Stat label="Declared relations" value={String(RELATIONS.length)} />
        </dl>
      </section>

      <GraphExample />

      <Section
        title="Roadmap"
        description="Built in order. A phase is never started while the one before it is broken."
      >
        <ol className="flex flex-col gap-2">
          {PHASES.map((phase) => (
            <li key={phase.number}>
              <Card
                padding="sm"
                className="flex items-center gap-4 border-l-2"
                style={{
                  borderLeftColor:
                    phase.status === 'done'
                      ? 'var(--flux-live)'
                      : phase.status === 'active'
                        ? 'var(--flux-accent)'
                        : 'var(--flux-border)',
                }}
              >
                <span className="w-14 shrink-0 font-mono text-xs text-ink-faint">
                  {String(phase.number).padStart(2, '0')}
                </span>
                <span className="flex-1 text-sm text-ink">{phase.title}</span>
                <span className="hidden max-w-sm flex-1 text-xs text-ink-muted md:block">
                  {phase.summary}
                </span>
                <PhaseBadge status={phase.status} />
              </Card>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        title="Where the feed goes"
        description="These sections are the shape of Home once there is something to put in them."
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {[
            ['Continue watching', 'clock', 3],
            ['Recommended', 'spark', 11],
            ['Trending', 'compass', 3],
            ['From your communities', 'users', 5],
            ['Live now', 'live', 9],
            ['New music', 'music', 8],
          ].map(([label, icon, phase]) => (
            <Card
              key={label as string}
              padding="sm"
              className="flex items-center gap-3 border-dashed bg-transparent shadow-none"
            >
              <Icon name={icon as 'clock'} className="text-ink-faint" />
              <span className="flex-1 text-sm text-ink-muted">{label as string}</span>
              <span className="text-[10px] font-medium text-ink-faint">P{phase as number}</span>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <dt className="text-[11px] uppercase tracking-wider text-ink-faint">{label}</dt>
      <dd className="font-mono text-lg text-ink">{value}</dd>
    </div>
  );
}

function PhaseBadge({ status }: { status: 'done' | 'active' | 'planned' }) {
  if (status === 'done') return <Badge tone="live">done</Badge>;
  if (status === 'active') return <Badge tone="accent">building</Badge>;
  return <Badge>planned</Badge>;
}
