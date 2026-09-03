import 'server-only';

import { cookies } from 'next/headers';

import { ForbiddenError, UnauthenticatedError } from '@flux/core';
import {
  type Actor,
  ANONYMOUS,
  type Permission,
  SESSION_COOKIE_NAME,
  type User,
  can,
  sessionCookieOptions,
} from '@flux/identity';

import { container } from './container';
import { env } from './env';

/**
 * Reading and enforcing the current identity, on the server.
 *
 * Pages and route handlers call these. Nothing here has a client-side
 * counterpart on purpose: an authorisation decision that a browser could make
 * for itself is not a decision.
 */

async function sessionToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(SESSION_COOKIE_NAME)?.value;
}

/** The signed-in user, or null. Never throws on a bad or expired token. */
export async function currentUser(): Promise<User | null> {
  const current = await container().identity.currentUser(await sessionToken());
  return current?.user ?? null;
}

/** The actor every authorisation check is made against. */
export async function currentActor(): Promise<Actor> {
  return container().identity.actorFor(await sessionToken());
}

/**
 * The signed-in user, or a thrown `unauthenticated`.
 *
 * For handlers where being signed out is a programming error rather than a
 * state to render.
 */
export async function requireUser(): Promise<User> {
  const user = await currentUser();
  if (!user) throw new UnauthenticatedError();
  return user;
}

/**
 * Assert a permission, on the server, before doing the thing.
 *
 * Throws rather than returning a boolean so a forgotten `if` cannot leave the
 * operation running unchecked.
 */
export async function requirePermission(
  permission: Permission,
  scope: { communityId?: string } = {},
): Promise<Actor> {
  const actor = await currentActor();
  if (!can(actor, permission, scope)) {
    throw actor.userId ? new ForbiddenError() : new UnauthenticatedError();
  }
  return actor;
}

/** Whether the current actor may do something. For rendering, not for guarding. */
export async function actorCan(
  permission: Permission,
  scope: { communityId?: string } = {},
): Promise<boolean> {
  return can(await currentActor(), permission, scope);
}

export { ANONYMOUS };

/* -------------------------------------------------------------------------- */
/* Cookie handling                                                            */
/* -------------------------------------------------------------------------- */

export async function setSessionCookie(token: string): Promise<void> {
  const options = sessionCookieOptions(env.NODE_ENV === 'production');
  const store = await cookies();
  store.set(options.name, token, {
    httpOnly: options.httpOnly,
    sameSite: options.sameSite,
    path: options.path,
    secure: options.secure,
    maxAge: options.maxAge,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const options = sessionCookieOptions(env.NODE_ENV === 'production');
  const store = await cookies();
  store.set(options.name, '', {
    httpOnly: options.httpOnly,
    sameSite: options.sameSite,
    path: options.path,
    secure: options.secure,
    maxAge: 0,
  });
}

/** Read the raw token, for handlers that need to revoke the exact session. */
export async function rawSessionToken(): Promise<string | undefined> {
  return sessionToken();
}
