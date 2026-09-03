'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@flux/ui';

import { Icon } from '@/components/Icon';
import { Wordmark } from '@/components/Wordmark';
import { MOBILE_NAV, PRIMARY_NAV, type NavItem, isActive } from '@/lib/navigation';
import { currentPhase } from '@/lib/roadmap';

function itemClasses(active: boolean, ready: boolean): string {
  return cn(
    'group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-150 ease-flux',
    ready
      ? active
        ? 'bg-accent-soft font-medium text-accent'
        : 'text-ink-muted hover:bg-surface-2 hover:text-ink'
      : 'cursor-not-allowed text-ink-faint',
  );
}

function SidebarItem({ item, active }: { item: NavItem; active: boolean }) {
  const content = (
    <>
      <Icon name={item.icon} />
      <span className="flex-1 truncate">{item.label}</span>
      {!item.ready ? (
        <span
          className="rounded-sm bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium text-ink-faint"
          title={`Arrives in phase ${item.phase}`}
        >
          P{item.phase}
        </span>
      ) : null}
    </>
  );

  // Not-yet-built destinations are shown, but never linked: a visible map of
  // the product beats five identical 404s.
  if (!item.ready) {
    return (
      <span aria-disabled="true" className={itemClasses(false, false)}>
        {content}
      </span>
    );
  }

  return (
    <Link href={item.href} aria-current={active ? 'page' : undefined} className={itemClasses(active, true)}>
      {content}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-y-0 left-0 z-30 hidden w-60 shrink-0 flex-col gap-6 overflow-y-auto border-r border-line bg-surface-1 px-3 py-4 lg:flex"
    >
      <Link href="/" className="px-2">
        <Wordmark />
      </Link>

      <div className="flex flex-col gap-6">
        {PRIMARY_NAV.map((group) => (
          <div key={group.id} className="flex flex-col gap-1">
            {group.label ? (
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                {group.label}
              </p>
            ) : null}
            {group.items.map((item) => (
              <SidebarItem key={item.href} item={item} active={isActive(pathname, item.href)} />
            ))}
          </div>
        ))}
      </div>

      <p className="mt-auto px-3 text-[11px] leading-relaxed text-ink-faint">
        Building phase {currentPhase.number} &middot; {currentPhase.title.toLowerCase()}.
        <br />
        Items marked P<em>n</em> arrive in that phase.
      </p>
    </nav>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-surface-1/95 backdrop-blur lg:hidden"
    >
      {MOBILE_NAV.map((item) => {
        const active = isActive(pathname, item.href);
        const classes = cn(
          'flex flex-1 flex-col items-center gap-1 py-2 text-[11px] transition-colors duration-150',
          item.ready
            ? active
              ? 'text-accent'
              : 'text-ink-muted'
            : 'text-ink-faint',
        );

        if (!item.ready) {
          return (
            <span key={item.href} aria-disabled="true" className={classes}>
              <Icon name={item.icon} size={22} />
              {item.label}
            </span>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={classes}
          >
            <Icon name={item.icon} size={22} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
