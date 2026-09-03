/**
 * Sessions.
 *
 * Opaque server-side sessions rather than a self-contained token: a session
 * must be revocable the instant a password changes or an account is
 * compromised, and a signed token that is valid until it expires cannot be.
 *
 * The cookie carries a random 32-byte secret. What is stored is
 * `HMAC-SHA256(server secret, token)`, so a leaked database is not a pile of
 * usable sessions - an attacker would also need the server secret. The lookup
 * stays a single indexed read, because the HMAC is deterministic.
 */

import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

import type { Id } from '@flux/core';

import type { UserId } from './user';

export type SessionId = Id<'session'>;

export interface Session {
  readonly id: SessionId;
  readonly userId: UserId;
  /** HMAC of the token the client holds. The token itself is never stored. */
  readonly tokenHash: string;
  readonly createdAt: string;
  readonly lastSeenAt: string;
  readonly expiresAt: string;
  /** Coarse client fingerprint, for the "your sessions" list. Never trusted. */
  readonly userAgent: string | null;
}

/** Absolute lifetime. A session is not extended indefinitely by being used. */
export const SESSION_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;

/** Unused for this long and the session is dead even if it has not expired. */
export const SESSION_IDLE_MS = 14 * 24 * 60 * 60 * 1000;

export const SESSION_COOKIE_NAME = 'flux_session';

/** A fresh, unguessable token. 256 bits of randomness. */
export function createSessionToken(): string {
  return randomBytes(32).toString('base64url');
}

export function hashSessionToken(token: string, secret: string): string {
  return createHmac('sha256', secret).update(token).digest('base64url');
}

/**
 * Compare two hashes without leaking where they differ.
 *
 * Both are server-computed here, so the risk is small - but constant-time
 * comparison of anything derived from a credential is the habit worth keeping.
 */
export function sessionHashMatches(a: string, b: string): boolean {
  const left = Buffer.from(a, 'utf8');
  const right = Buffer.from(b, 'utf8');
  return left.length === right.length && timingSafeEqual(left, right);
}

export function isSessionExpired(session: Session, nowMs: number): boolean {
  if (Date.parse(session.expiresAt) <= nowMs) return true;
  return Date.parse(session.lastSeenAt) + SESSION_IDLE_MS <= nowMs;
}

/** The cookie attributes FLUX sets, in one place so no route can weaken them. */
export interface SessionCookieOptions {
  readonly name: string;
  readonly httpOnly: true;
  readonly sameSite: 'lax';
  readonly path: '/';
  readonly secure: boolean;
  readonly maxAge: number;
}

export function sessionCookieOptions(secure: boolean): SessionCookieOptions {
  return {
    name: SESSION_COOKIE_NAME,
    // Not readable from JavaScript: an XSS bug must not also be a session theft.
    httpOnly: true,
    // Lax still sends the cookie on top-level navigation, so a shared link to a
    // signed-in page works, while cross-site form posts do not carry it.
    sameSite: 'lax',
    path: '/',
    // Off in development so http://localhost works; on everywhere else.
    secure,
    maxAge: Math.floor(SESSION_LIFETIME_MS / 1000),
  };
}
