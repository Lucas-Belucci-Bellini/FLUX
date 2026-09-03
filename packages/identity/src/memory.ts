/**
 * In-memory adapters.
 *
 * The default store: with no DATABASE_URL, FLUX runs entirely on these, so a
 * clean checkout boots with nothing installed. They are also what the tests
 * use, which is why the suite is fast and deterministic.
 *
 * They are adapters, not mocks. They implement the same contract the
 * PostgreSQL adapters do and are held to the same test suite.
 */

import { type Page, type PageRequest, paginate } from '@flux/core';

import type { CreateUserInput, SessionRepository, UserRepository } from './ports';
import { type Session, type SessionId, isSessionExpired } from './session';
import { emptyProfile, type User, type UserId } from './user';

export class InMemoryUserRepository implements UserRepository {
  readonly #byId = new Map<string, User>();
  readonly #byHandleKey = new Map<string, string>();
  readonly #byEmail = new Map<string, string>();

  async create(input: CreateUserInput): Promise<{ user: User } | { conflict: 'handle' | 'email' }> {
    // Checked here rather than in the service: this is the only place that can
    // make the check and the insert one indivisible step.
    if (this.#byHandleKey.has(input.handleKey)) return { conflict: 'handle' };
    if (this.#byEmail.has(input.email)) return { conflict: 'email' };

    const user: User = {
      id: input.id,
      handle: input.handle,
      handleKey: input.handleKey,
      email: input.email,
      emailVerifiedAt: null,
      passwordHash: input.passwordHash,
      // The first account on an empty instance owns it; everyone after is a
      // member. Without this there is no way to reach the admin surface.
      roles: this.#byId.size === 0 ? ['admin'] : ['member'],
      profile: emptyProfile(input.displayName),
      suspendedAt: null,
      createdAt: input.createdAt,
      updatedAt: input.createdAt,
    };

    this.#byId.set(user.id, user);
    this.#byHandleKey.set(user.handleKey, user.id);
    this.#byEmail.set(user.email, user.id);
    return { user };
  }

  async findById(id: UserId): Promise<User | null> {
    return this.#byId.get(id) ?? null;
  }

  async findByHandleKey(handleKey: string): Promise<User | null> {
    const id = this.#byHandleKey.get(handleKey);
    return id ? (this.#byId.get(id) ?? null) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const id = this.#byEmail.get(email);
    return id ? (this.#byId.get(id) ?? null) : null;
  }

  async update(id: UserId, patch: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | null> {
    const current = this.#byId.get(id);
    if (!current) return null;

    const next: User = { ...current, ...patch, id: current.id, createdAt: current.createdAt };
    this.#byId.set(id, next);

    if (patch.handleKey && patch.handleKey !== current.handleKey) {
      this.#byHandleKey.delete(current.handleKey);
      this.#byHandleKey.set(patch.handleKey, id);
    }
    if (patch.email && patch.email !== current.email) {
      this.#byEmail.delete(current.email);
      this.#byEmail.set(patch.email, id);
    }
    return next;
  }

  async list(page: PageRequest): Promise<Page<User>> {
    // Ids sort by creation time, so newest-first needs no extra sort key.
    const sorted = [...this.#byId.values()].sort((a, b) => b.id.localeCompare(a.id));
    return paginate(sorted, page, (user) => ({ key: user.createdAt, id: user.id }));
  }

  get size(): number {
    return this.#byId.size;
  }
}

export class InMemorySessionRepository implements SessionRepository {
  readonly #byId = new Map<string, Session>();
  readonly #byTokenHash = new Map<string, string>();

  async create(session: Session): Promise<Session> {
    this.#byId.set(session.id, session);
    this.#byTokenHash.set(session.tokenHash, session.id);
    return session;
  }

  async findByTokenHash(tokenHash: string): Promise<Session | null> {
    const id = this.#byTokenHash.get(tokenHash);
    return id ? (this.#byId.get(id) ?? null) : null;
  }

  async touch(id: SessionId, at: string): Promise<void> {
    const session = this.#byId.get(id);
    if (session) this.#byId.set(id, { ...session, lastSeenAt: at });
  }

  async delete(id: SessionId): Promise<boolean> {
    const session = this.#byId.get(id);
    if (!session) return false;
    this.#byId.delete(id);
    this.#byTokenHash.delete(session.tokenHash);
    return true;
  }

  async deleteAllForUser(userId: UserId): Promise<number> {
    let removed = 0;
    for (const session of [...this.#byId.values()]) {
      if (session.userId === userId) {
        this.#byId.delete(session.id);
        this.#byTokenHash.delete(session.tokenHash);
        removed++;
      }
    }
    return removed;
  }

  async listForUser(userId: UserId): Promise<readonly Session[]> {
    return [...this.#byId.values()]
      .filter((session) => session.userId === userId)
      .sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt));
  }

  async deleteExpired(nowMs: number): Promise<number> {
    let removed = 0;
    for (const session of [...this.#byId.values()]) {
      if (isSessionExpired(session, nowMs)) {
        this.#byId.delete(session.id);
        this.#byTokenHash.delete(session.tokenHash);
        removed++;
      }
    }
    return removed;
  }

  get size(): number {
    return this.#byId.size;
  }
}
