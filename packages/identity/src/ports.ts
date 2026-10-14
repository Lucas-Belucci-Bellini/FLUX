/**
 * The persistence contract for identity.
 *
 * Everything above this file depends on these interfaces, never on a driver.
 * Two adapters implement them - in-memory and PostgreSQL - and the same test
 * suite runs against both, so they cannot quietly disagree.
 */

import type { Page, PageRequest } from '@flux/core';

import type { Session, SessionId } from './session';
import type { User, UserId } from './user';

export interface CreateUserInput {
  readonly id: UserId;
  readonly handle: string;
  readonly handleKey: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly displayName: string;
  readonly createdAt: string;
}

export interface UserRepository {
  /**
   * Insert a user.
   *
   * Uniqueness of handle and email is the repository's job, not the caller's:
   * a check-then-insert in the service would still lose a race against a
   * simultaneous signup. Returns `null` when the handle or email is taken, and
   * says which.
   */
  create(input: CreateUserInput): Promise<{ user: User } | { conflict: 'handle' | 'email' }>;

  findById(id: UserId): Promise<User | null>;
  /** Looked up by the folded handle, never the display form. */
  findByHandleKey(handleKey: string): Promise<User | null>;
  /** Looked up by the folded email. */
  findByEmail(email: string): Promise<User | null>;

  update(id: UserId, patch: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | null>;

  /** For the admin surface; paged like everything else. */
  list(page: PageRequest): Promise<Page<User>>;
}

export interface SessionRepository {
  create(session: Session): Promise<Session>;
  findByTokenHash(tokenHash: string): Promise<Session | null>;
  /** Record that the session was used, for idle expiry and the sessions list. */
  touch(id: SessionId, at: string): Promise<void>;
  delete(id: SessionId): Promise<boolean>;
  /** Sign out everywhere. Called on password change and on suspension. */
  deleteAllForUser(userId: UserId): Promise<number>;
  listForUser(userId: UserId): Promise<readonly Session[]>;
  /** Housekeeping; the PostgreSQL adapter runs this on a schedule. */
  deleteExpired(nowMs: number): Promise<number>;
}
