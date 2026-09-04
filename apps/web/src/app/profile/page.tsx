import Link from 'next/link';

import { Badge, Card, Section } from '@flux/ui';

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-5 pt-2">
        <Badge tone="accent" className="self-start">Profile foundation</Badge>
        <Card padding="lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xl font-semibold text-ink-muted" aria-hidden="true">
              F
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-[-0.02em] text-ink">FLUX Member</h1>
              <p className="text-sm text-ink-muted">@member</p>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">
                Your profile is the identity hub connecting videos, posts, communities, playlists and other graph relationships.
              </p>
            </div>
          </div>
        </Card>
      </section>

      <Section title="Activity surface" description="The profile contract is prepared for real domain projections instead of duplicated profile data.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {['Videos', 'Posts', 'Communities', 'Playlists'].map((item) => (
            <Card key={item} padding="md">
              <p className="text-xs uppercase tracking-wider text-ink-faint">{item}</p>
              <p className="mt-2 font-mono text-lg text-ink">—</p>
              <p className="mt-1 text-xs text-ink-muted">Not connected yet</p>
            </Card>
          ))}
        </div>
      </Section>

      <Link href="/" className="text-sm text-accent hover:underline">Back to Home</Link>
    </div>
  );
}
