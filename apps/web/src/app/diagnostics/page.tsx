import type { Metadata } from 'next';

import { EDGE_KINDS, FLUX_EVENT_NAMES, NODE_KINDS, RELATIONS } from '@flux/core';
import { Badge, Card, Section } from '@flux/ui';

import { PHASES } from '@/lib/roadmap';
import { env, usingInMemoryStore } from '@/lib/env';

export const metadata: Metadata = { title: 'Diagnostics' };

/**
 * What the platform currently declares about itself.
 *
 * Everything here is read from the running code rather than written down by
 * hand, so it cannot drift from reality. When something looks wrong in the
 * product, this is the first page to open.
 */
export default function DiagnosticsPage() {
  const byEdge = EDGE_KINDS.map((edge) => ({
    edge,
    rules: RELATIONS.filter((relation) => relation.edge === edge),
  }));

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-ink">Diagnostics</h1>
        <p className="max-w-2xl text-sm text-ink-muted">
          Read straight out of the running process. Nothing on this page is written twice.
        </p>
      </header>

      <Section title="Runtime">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Fact label="Mode" value={env.NODE_ENV} />
          <Fact label="App URL" value={env.FLUX_APP_URL} />
          <Fact
            label="Store"
            value={usingInMemoryStore ? 'in-memory' : 'postgresql'}
            tone={usingInMemoryStore ? 'accent' : 'live'}
            note={
              usingInMemoryStore
                ? 'No DATABASE_URL set. Data lives for the life of the process.'
                : 'DATABASE_URL is set.'
            }
          />
          <Fact
            label="Session secret"
            value={env.FLUX_SESSION_SECRET ? 'configured' : 'development default'}
            tone={env.FLUX_SESSION_SECRET ? 'live' : 'neutral'}
          />
        </div>
      </Section>

      <Section
        title="Content graph"
        description={`${NODE_KINDS.length} node kinds, ${EDGE_KINDS.length} edge kinds, ${RELATIONS.length} declared relations. Anything absent from this table cannot be written to the graph.`}
      >
        <div className="flex flex-col gap-4">
          {byEdge.map(({ edge, rules }) => (
            <Card key={edge} padding="sm" className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <code className="font-mono text-xs font-semibold text-accent">{edge}</code>
                <span className="text-[11px] text-ink-faint">
                  {rules.length} {rules.length === 1 ? 'relation' : 'relations'}
                </span>
              </div>
              <ul className="flex flex-wrap gap-x-4 gap-y-1">
                {rules.map((rule) => (
                  <li
                    key={`${rule.from}-${rule.to}`}
                    className="font-mono text-[11px] text-ink-muted"
                    title={`${rule.label} / ${rule.inverseLabel}`}
                  >
                    {rule.from}
                    <span className="text-ink-faint"> &rarr; </span>
                    {rule.to}
                    {rule.cardinality === 'one' ? (
                      <span className="text-ink-faint"> (1)</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        title="Event catalogue"
        description="Everything the platform announces. Modules subscribe to these instead of calling each other."
      >
        <ul className="flex flex-wrap gap-2">
          {FLUX_EVENT_NAMES.map((name) => (
            <li key={name}>
              <code className="rounded-sm border border-line bg-surface-1 px-2 py-1 font-mono text-[11px] text-ink-muted">
                {name}
              </code>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Build order">
        <ul className="flex flex-wrap gap-2">
          {PHASES.map((phase) => (
            <li key={phase.number}>
              <Badge
                tone={phase.status === 'done' ? 'live' : phase.status === 'active' ? 'accent' : 'neutral'}
              >
                {String(phase.number).padStart(2, '0')} {phase.title}
              </Badge>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

function Fact({
  label,
  value,
  note,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  note?: string;
  tone?: 'neutral' | 'accent' | 'live';
}) {
  return (
    <Card padding="sm" className="flex flex-col gap-1.5">
      <span className="text-[11px] uppercase tracking-wider text-ink-faint">{label}</span>
      <Badge tone={tone} className="self-start">
        {value}
      </Badge>
      {note ? <span className="text-[11px] leading-relaxed text-ink-muted">{note}</span> : null}
    </Card>
  );
}
