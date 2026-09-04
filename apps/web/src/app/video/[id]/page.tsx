import Link from 'next/link';

import { Badge, Card, Section } from '@flux/ui';

interface VideoPageProps {
  params: Promise<{ id: string }>;
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { id } = await params;

  return (
    <div className="flex flex-col gap-8">
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-4">
          <div className="aspect-video overflow-hidden rounded-xl border border-line bg-surface-2" aria-label="Video player placeholder">
            <div className="flex h-full items-center justify-center text-sm text-ink-faint">Player · media pipeline pending</div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="accent">Video</Badge>
              <span className="font-mono text-xs text-ink-faint">{id}</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-[-0.02em] text-ink">Video content route</h1>
            <p className="max-w-3xl text-sm leading-relaxed text-ink-muted">
              This route establishes the player and content graph boundary. Real metadata, media playback, reactions and comments attach to the domain contracts without changing the URL shape.
            </p>
          </div>
        </div>

        <Card padding="md">
          <p className="text-xs uppercase tracking-wider text-ink-faint">Content graph</p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-ink-muted">
            {['Creator', 'Community', 'Playlist', 'Music', 'Products', 'Discussion'].map((relation) => (
              <div key={relation} className="rounded-lg border border-line bg-surface-1 px-3 py-2">{relation} · pending relation</div>
            ))}
          </div>
        </Card>
      </section>

      <Section title="Discussion" description="Comments are a separate domain and will attach here through the content graph.">
        <Card padding="md">
          <p className="text-sm text-ink-muted">No comments loaded. Comment persistence and moderation are implemented in the social phases.</p>
        </Card>
      </Section>

      <Link href="/" className="text-sm text-accent hover:underline">Back to Home</Link>
    </div>
  );
}
