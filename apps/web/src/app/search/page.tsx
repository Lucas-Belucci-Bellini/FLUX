import Link from 'next/link';

import { Badge, Card, Section } from '@flux/ui';

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? '';

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3 pt-2">
        <Badge tone="accent" className="self-start">Universal search</Badge>
        <h1 className="text-3xl font-semibold tracking-[-0.02em] text-ink">Search FLUX</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-ink-muted">
          One search surface for videos, creators, communities, posts, music, lives and products.
        </p>
      </section>

      {query ? (
        <Section title={`Results for “${query}”`} description="The result contract is ready; indexing and relevance arrive in the discovery phase.">
          <div className="grid gap-3 md:grid-cols-2">
            {['Videos', 'Creators', 'Communities', 'Posts', 'Music', 'Products'].map((kind) => (
              <Card key={kind} padding="md" className="flex items-center gap-4">
                <div className="flex size-10 items-center justify-center rounded-lg bg-surface-2 text-xs font-semibold text-ink-muted">
                  {kind.slice(0, 1)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{kind}</p>
                  <p className="text-xs text-ink-muted">Awaiting live index</p>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      ) : (
        <Card padding="lg">
          <p className="text-sm text-ink-muted">Use the search field above to start a universal search.</p>
        </Card>
      )}

      <Link href="/" className="text-sm text-accent hover:underline">Back to Home</Link>
    </div>
  );
}
