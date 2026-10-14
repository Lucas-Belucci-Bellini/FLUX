/**
 * Handles - the @name a person is known by across the whole platform.
 *
 * A handle is public, permanent enough to be linked to, and shared with
 * communities, creators and stores in one namespace. The rules here are the
 * only definition of what one may be.
 */

import { InvalidInputError, type Result, err, ok } from '@flux/core';

export const HANDLE_MIN_LENGTH = 3;
export const HANDLE_MAX_LENGTH = 24;

/** Lowercase letters, digits and underscore; must start with a letter. */
const HANDLE_PATTERN = /^[a-z][a-z0-9_]*$/;

/**
 * Names the platform keeps for itself.
 *
 * Two reasons: routes (`/settings` must not be ambiguous with a profile), and
 * impersonation (`@support` asking for your password is the oldest trick there
 * is). Every top-level route belongs in this list.
 */
export const RESERVED_HANDLES: ReadonlySet<string> = new Set([
  // the platform
  'flux',
  'admin',
  'administrator',
  'root',
  'system',
  'staff',
  'team',
  'official',
  'support',
  'help',
  'security',
  'moderator',
  'mod',
  'billing',
  'legal',
  'abuse',
  'noreply',
  'no_reply',
  // routes, present and planned
  'api',
  'auth',
  'signin',
  'signup',
  'login',
  'logout',
  'register',
  'settings',
  'account',
  'explore',
  'search',
  'shorts',
  'communities',
  'community',
  'music',
  'live',
  'shop',
  'store',
  'library',
  'history',
  'liked',
  'watch',
  'watch_later',
  'studio',
  'diagnostics',
  'about',
  'terms',
  'privacy',
  'static',
  'assets',
  'public',
  'u',
  'c',
  'v',
]);

/**
 * Fold a handle to the form uniqueness is checked against.
 *
 * Handles are compared case-insensitively, so `@Vector` and `@vector` are the
 * same account and cannot both exist. The display form is kept separately.
 */
export function normaliseHandle(handle: string): string {
  return handle.trim().toLowerCase();
}

export function validateHandle(input: string): Result<string, InvalidInputError> {
  const handle = normaliseHandle(input);

  if (handle.length < HANDLE_MIN_LENGTH) {
    return err(
      new InvalidInputError(`A handle needs at least ${HANDLE_MIN_LENGTH} characters.`, {
        field: 'handle',
      }),
    );
  }
  if (handle.length > HANDLE_MAX_LENGTH) {
    return err(
      new InvalidInputError(`A handle can be at most ${HANDLE_MAX_LENGTH} characters.`, {
        field: 'handle',
      }),
    );
  }
  if (!HANDLE_PATTERN.test(handle)) {
    return err(
      new InvalidInputError(
        'A handle must start with a letter and use only letters, numbers and underscores.',
        { field: 'handle' },
      ),
    );
  }
  if (RESERVED_HANDLES.has(handle)) {
    return err(new InvalidInputError('That handle is reserved.', { field: 'handle' }));
  }

  return ok(handle);
}

/**
 * Two handles that look alike to a reader.
 *
 * `@f1ux` next to `@flux` is an impersonation attempt, not a coincidence.
 * Folding the confusable characters gives a key that catches the common cases;
 * it is a guard on registration, not a claim to catch every homoglyph.
 */
export function confusableKey(handle: string): string {
  return normaliseHandle(handle)
    .replaceAll('_', '')
    .replaceAll('0', 'o')
    .replaceAll('1', 'l')
    .replaceAll('3', 'e')
    .replaceAll('4', 'a')
    .replaceAll('5', 's')
    .replaceAll('7', 't')
    .replaceAll('8', 'b');
}
