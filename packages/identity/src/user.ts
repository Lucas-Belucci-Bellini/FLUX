/**
 * The account and the profile it presents.
 *
 * Split on purpose: `User` is private (email, credentials, roles, suspension),
 * `Profile` is what everyone else sees. Anything that leaves the server for a
 * page other than the owner's goes through `publicProfile()`, which makes
 * leaking an email address a deliberate act rather than a forgotten `select`.
 */

import type { Id } from '@flux/core';

import type { PlatformRole } from './permissions';

export type UserId = Id<'user'>;

export interface Profile {
  /** Shown as typed; uniqueness is checked on the folded form. */
  readonly displayName: string;
  readonly bio: string;
  readonly avatarUrl: string | null;
  readonly bannerUrl: string | null;
  readonly location: string | null;
  readonly links: readonly { readonly label: string; readonly url: string }[];
}

export interface User {
  readonly id: UserId;
  /** The display form of the handle, as the person typed it. */
  readonly handle: string;
  /** Lowercase; what uniqueness is checked against. */
  readonly handleKey: string;
  readonly email: string;
  readonly emailVerifiedAt: string | null;
  readonly passwordHash: string;
  readonly roles: readonly PlatformRole[];
  readonly profile: Profile;
  readonly suspendedAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** The shape any other user is allowed to see. */
export interface PublicProfile {
  readonly id: UserId;
  readonly handle: string;
  readonly displayName: string;
  readonly bio: string;
  readonly avatarUrl: string | null;
  readonly bannerUrl: string | null;
  readonly location: string | null;
  readonly links: readonly { readonly label: string; readonly url: string }[];
  readonly roles: readonly PlatformRole[];
  readonly createdAt: string;
  readonly suspended: boolean;
}

export function publicProfile(user: User): PublicProfile {
  return {
    id: user.id,
    handle: user.handle,
    displayName: user.profile.displayName,
    bio: user.profile.bio,
    avatarUrl: user.profile.avatarUrl,
    bannerUrl: user.profile.bannerUrl,
    location: user.profile.location,
    links: user.profile.links,
    roles: user.roles,
    createdAt: user.createdAt,
    suspended: user.suspendedAt !== null,
  };
}

/** The shape the owner sees of their own account. */
export interface SelfProfile extends PublicProfile {
  readonly email: string;
  readonly emailVerified: boolean;
}

export function selfProfile(user: User): SelfProfile {
  return {
    ...publicProfile(user),
    email: user.email,
    emailVerified: user.emailVerifiedAt !== null,
  };
}

/**
 * Fold an email to the form uniqueness is checked against.
 *
 * Only case, because that is all the standard guarantees. Stripping dots or
 * `+tags` is a provider-specific behaviour, and applying it universally
 * silently merges addresses that are genuinely different people.
 */
export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function emptyProfile(displayName: string): Profile {
  return {
    displayName,
    bio: '',
    avatarUrl: null,
    bannerUrl: null,
    location: null,
    links: [],
  };
}
