import type { IconName } from '@/components/Icon';

/**
 * The navigation model.
 *
 * Every destination FLUX will have is listed here from the start, each with the
 * phase that builds it. Anything not yet built renders as a disabled item
 * saying which phase brings it, rather than as a link into a 404 - the map of
 * the product stays honest while it is still being drawn.
 */

export interface NavItem {
  readonly href: string;
  readonly label: string;
  readonly icon: IconName;
  /** Whether the destination exists today. */
  readonly ready: boolean;
  /** The roadmap phase that builds it. See ROADMAP.md. */
  readonly phase: number;
}

export interface NavGroup {
  readonly id: string;
  readonly label?: string;
  readonly items: readonly NavItem[];
}

export const PRIMARY_NAV: readonly NavGroup[] = [
  {
    id: 'discover',
    items: [
      { href: '/', label: 'Home', icon: 'home', ready: true, phase: 0 },
      { href: '/explore', label: 'Explore', icon: 'compass', ready: false, phase: 3 },
      { href: '/shorts', label: 'Shorts', icon: 'shorts', ready: false, phase: 2 },
      { href: '/communities', label: 'Communities', icon: 'users', ready: false, phase: 5 },
      { href: '/music', label: 'Music', icon: 'music', ready: false, phase: 8 },
      { href: '/live', label: 'Live', icon: 'live', ready: false, phase: 9 },
      { href: '/shop', label: 'Shop', icon: 'bag', ready: false, phase: 10 },
    ],
  },
  {
    id: 'you',
    label: 'You',
    items: [
      { href: '/library', label: 'Library', icon: 'library', ready: false, phase: 3 },
      { href: '/history', label: 'History', icon: 'clock', ready: false, phase: 3 },
      { href: '/watch-later', label: 'Watch later', icon: 'bookmark', ready: false, phase: 3 },
      { href: '/liked', label: 'Liked', icon: 'heart', ready: false, phase: 3 },
    ],
  },
  {
    id: 'platform',
    label: 'Platform',
    items: [
      { href: '/settings/profile', label: 'Your profile', icon: 'users', ready: true, phase: 1 },
      { href: '/diagnostics', label: 'Diagnostics', icon: 'activity', ready: true, phase: 0 },
    ],
  },
];

/** The condensed set for the mobile tab bar - five is the most a thumb reaches. */
export const MOBILE_NAV: readonly NavItem[] = [
  { href: '/', label: 'Home', icon: 'home', ready: true, phase: 0 },
  { href: '/explore', label: 'Explore', icon: 'compass', ready: false, phase: 3 },
  { href: '/shorts', label: 'Shorts', icon: 'shorts', ready: false, phase: 2 },
  { href: '/communities', label: 'Groups', icon: 'users', ready: false, phase: 5 },
  { href: '/music', label: 'Music', icon: 'music', ready: false, phase: 8 },
];

export function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}
