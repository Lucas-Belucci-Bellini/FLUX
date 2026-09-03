import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { publicProfile } from '@flux/identity';
import { Avatar, Badge, Card, EmptyState, Section } from '@flux/ui';

import { currentUser } from '@/lib/auth';
import { container } from '@/lib/container';

/**
 * A public profile.
 *
 * Everything rendered here comes from `publicProfile()`, which is the only
 * function allowed to turn a User into something another person may see. The
 * email and the password hash are not omitted by this page remembering to omit
 * them - they never arrive.
 */

interface Props {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const user = await container().identity.findByHandle(handle);
  if (!user) return { title: 'Profile not found' };
  return {
    title: `${user.profile.displayName} (@${user.handle})`,
    description: user.profile.bio || undefined,
  };
}

export default async function ProfilePage({ params }: Props) {
  const { handle } = await params;
  const user = await container().identity.findByHandle(handle);
  if (!user) notFound();

  const profile = publicProfile(user);
  const viewer = await currentUser();
  const isOwner = viewer?.id === profile.id;

  // A suspended account is not silently missing - that would leave people
  // wondering whether they were blocked - but nothing of it is shown either.
  if (profile.suspended && !isOwner) {
    return (
      <div className="py-16">
        <EmptyState
          title="This account is suspended"
          description="Its profile and content are not available."
        />
      </div>
    );
  }

  const joined = new Date(profile.createdAt).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="h-32 rounded-lg border border-line bg-surface-2 sm:h-44" />

      <div className="-mt-16 flex flex-col gap-4 px-1 sm:-mt-20 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Avatar
            name={profile.displayName}
            src={profile.avatarUrl ?? undefined}
            size="xl"
            className="border-4 border-surface-0"
          />
          <div className="flex flex-col gap-1 pb-1">
            <h1 className="text-xl font-semibold tracking-[-0.01em] text-ink">
              {profile.displayName}
            </h1>
            <p className="font-mono text-sm text-ink-muted">@{profile.handle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 pb-1">
          {profile.roles.includes('admin') ? <Badge tone="accent">admin</Badge> : null}
          {profile.roles.includes('moderator') ? <Badge tone="accent">moderator</Badge> : null}
          {isOwner ? (
            <Link
              href="/settings/profile"
              className="inline-flex h-8 items-center rounded-md border border-line bg-surface-2 px-3 text-xs font-medium text-ink transition-colors duration-150 ease-flux hover:bg-surface-3"
            >
              Edit profile
            </Link>
          ) : null}
        </div>
      </div>

      {profile.bio ? (
        <p className="max-w-2xl whitespace-pre-line text-sm leading-relaxed text-ink">
          {profile.bio}
        </p>
      ) : null}

      <dl className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-ink-muted">
        <div className="flex gap-1.5">
          <dt className="text-ink-faint">Joined</dt>
          <dd>{joined}</dd>
        </div>
        {profile.location ? (
          <div className="flex gap-1.5">
            <dt className="text-ink-faint">Location</dt>
            <dd>{profile.location}</dd>
          </div>
        ) : null}
        {profile.links.map((link) => (
          <div key={link.url} className="flex gap-1.5">
            <dt className="sr-only">Link</dt>
            <dd>
              <a
                href={link.url}
                rel="nofollow noopener ugc"
                target="_blank"
                className="text-accent hover:underline"
              >
                {link.label}
              </a>
            </dd>
          </div>
        ))}
      </dl>

      <Section
        title="Content"
        description="Videos, shorts, posts and playlists appear here as later phases build them."
      >
        <Card padding="none" className="border-dashed bg-transparent shadow-none">
          <EmptyState
            title="Nothing published yet"
            description="Videos and shorts arrive in phase 2; posts in phase 6."
            className="border-0 bg-transparent"
          />
        </Card>
      </Section>
    </div>
  );
}
