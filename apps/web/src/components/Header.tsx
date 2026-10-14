import Link from 'next/link';

import { Avatar, Button, Input, ThemeToggle } from '@flux/ui';

import { signOutAction } from '@/app/actions/auth';
import { Icon } from '@/components/Icon';
import { Wordmark } from '@/components/Wordmark';
import { currentUser } from '@/lib/auth';

/**
 * One search field for the whole platform, and the identity controls.
 *
 * Search is a plain GET form, so it works before any JavaScript loads and the
 * result is a linkable URL. The search page itself arrives in phase 3.
 */
export async function Header() {
  const user = await currentUser();

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line bg-surface-0/85 px-4 backdrop-blur lg:px-6">
      <Link href="/" className="shrink-0 lg:hidden">
        <Wordmark />
      </Link>

      {/* min-w-0 lets the field shrink; without it the actions get pushed off-screen. */}
      <form action="/search" role="search" className="min-w-0 flex-1 lg:max-w-md">
        <label htmlFor="q" className="sr-only">
          Search FLUX
        </label>
        <Input
          id="q"
          name="q"
          type="search"
          autoComplete="off"
          placeholder="Search videos, communities, music, products"
          leading={<Icon name="search" size={16} />}
        />
      </form>

      <div className="flex shrink-0 items-center gap-2">
        {user ? (
          <>
            <Button
              variant="secondary"
              size="sm"
              leading={<Icon name="plus" size={16} />}
              disabled
              title="Publishing arrives in phase 2"
            >
              <span className="hidden sm:inline">Create</span>
            </Button>

            {/* A form, not a link: signing out changes state, so it must not
                be reachable by a prefetch or a crawler following a GET. */}
            <form action={signOutAction}>
              <button
                type="submit"
                className="hidden h-8 items-center rounded-md px-2 text-xs text-ink-muted transition-colors duration-150 ease-flux hover:bg-surface-2 hover:text-ink sm:inline-flex"
              >
                Sign out
              </button>
            </form>

            <Link href={`/u/${user.handle}`} title={`@${user.handle}`}>
              <Avatar
                name={user.profile.displayName}
                src={user.profile.avatarUrl ?? undefined}
                size="sm"
              />
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/signin"
              className="inline-flex h-8 items-center rounded-md px-3 text-xs font-medium text-ink-muted transition-colors duration-150 ease-flux hover:bg-surface-2 hover:text-ink"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-8 items-center rounded-md bg-accent px-3 text-xs font-medium text-on-accent transition-colors duration-150 ease-flux hover:bg-accent-hover"
            >
              <span className="hidden sm:inline">Create account</span>
              <span className="sm:hidden">Join</span>
            </Link>
          </>
        )}

        <ThemeToggle />
      </div>
    </header>
  );
}
