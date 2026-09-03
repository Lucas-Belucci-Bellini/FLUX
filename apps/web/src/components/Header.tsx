import Link from 'next/link';

import { Button, Input, ThemeToggle } from '@flux/ui';

import { Icon } from '@/components/Icon';
import { Wordmark } from '@/components/Wordmark';

/**
 * One search field for the whole platform.
 *
 * It is a plain GET form, so it works before any JavaScript loads and the
 * result is a linkable URL. The search page itself arrives in phase 3; until
 * then the route exists and says so.
 */
export function Header() {
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
        <Button variant="secondary" size="sm" leading={<Icon name="plus" size={16} />}>
          <span className="hidden sm:inline">Create</span>
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
