/**
 * The identity service: register, sign in, resolve the current actor, sign out.
 *
 * Everything above it - route handlers, server actions, pages - calls this and
 * nothing else. It owns the security decisions so they exist once rather than
 * once per entry point.
 */

import {
  ConflictError,
  type Clock,
  type EventBus,
  type FluxError,
  ForbiddenError,
  InvalidInputError,
  NotFoundError,
  type Result,
  UnauthenticatedError,
  createId,
  err,
  ok,
  systemClock,
} from '@flux/core';

import { normaliseHandle, validateHandle } from './handle';
import { hashPassword, needsRehash, verifyPassword } from './password';
import { type Actor, ANONYMOUS } from './permissions';
import type { SessionRepository, UserRepository } from './ports';
import {
  SESSION_LIFETIME_MS,
  type Session,
  type SessionId,
  createSessionToken,
  hashSessionToken,
  isSessionExpired,
} from './session';
import type { RegisterInput, SignInInput, UpdateProfileInput } from './schemas';
import { type User, type UserId, normaliseEmail } from './user';

export interface IdentityServiceOptions {
  readonly users: UserRepository;
  readonly sessions: SessionRepository;
  /** Pepper for session token hashes. See session.ts. */
  readonly sessionSecret: string;
  readonly clock?: Clock;
  readonly events?: EventBus;
}

export interface SignedIn {
  readonly user: User;
  readonly session: Session;
  /** The value to put in the cookie. Never stored, never logged. */
  readonly token: string;
}

/**
 * A dummy hash with the real cost parameters.
 *
 * Verified against when no account matches, so a sign-in attempt for an
 * address that does not exist takes the same time as one that does. Without
 * it, response timing is an account-enumeration oracle.
 */
let decoyHashPromise: Promise<string> | null = null;
function decoyHash(): Promise<string> {
  decoyHashPromise ??= hashPassword('flux-timing-decoy-not-a-real-password');
  return decoyHashPromise;
}

export class IdentityService {
  readonly #users: UserRepository;
  readonly #sessions: SessionRepository;
  readonly #secret: string;
  readonly #clock: Clock;
  readonly #events: EventBus | undefined;

  constructor(options: IdentityServiceOptions) {
    this.#users = options.users;
    this.#sessions = options.sessions;
    this.#secret = options.sessionSecret;
    this.#clock = options.clock ?? systemClock;
    this.#events = options.events;
  }

  /* ---------------------------------------------------------------------- */
  /* Registration                                                           */
  /* ---------------------------------------------------------------------- */

  async register(input: RegisterInput): Promise<Result<SignedIn, FluxError>> {
    const handleResult = validateHandle(input.handle);
    if (!handleResult.ok) return handleResult;

    const handleKey = handleResult.value;
    const email = normaliseEmail(input.email);
    const now = this.#clock.timestamp();

    const created = await this.#users.create({
      id: createId<'user'>(),
      // Kept as typed so the profile can read `@Vector`, while uniqueness and
      // every lookup use the folded form.
      handle: input.handle.trim(),
      handleKey,
      email,
      passwordHash: await hashPassword(input.password),
      displayName: input.displayName?.trim() || input.handle.trim(),
      createdAt: now,
    });

    if ('conflict' in created) {
      return err(
        created.conflict === 'handle'
          ? new ConflictError('That handle is taken.', { field: 'handle' })
          : // Deliberately the same shape as any other conflict: it confirms an
            // address is registered, which the person signing up already knows.
            new ConflictError('An account already exists for that email.', { field: 'email' }),
      );
    }

    await this.#events?.emit('user:registered', {
      userId: created.user.id,
      handle: created.user.handle,
    });

    return ok(await this.#startSession(created.user, null));
  }

  /* ---------------------------------------------------------------------- */
  /* Sign in                                                                */
  /* ---------------------------------------------------------------------- */

  async signIn(
    input: SignInInput,
    context: { userAgent?: string | null } = {},
  ): Promise<Result<SignedIn, FluxError>> {
    const identifier = input.identifier.trim();
    const user = identifier.includes('@')
      ? await this.#users.findByEmail(normaliseEmail(identifier))
      : await this.#users.findByHandleKey(normaliseHandle(identifier));

    // Always run a verification, even with no user, so the two paths cost the
    // same. Then answer with one message either way.
    const hash = user?.passwordHash ?? (await decoyHash());
    const matches = await verifyPassword(input.password, hash);

    if (!user || !matches) {
      return err(new UnauthenticatedError('That handle or password is not right.'));
    }

    if (user.suspendedAt) {
      return err(new ForbiddenError('This account is suspended.'));
    }

    // Cost parameters were raised since this password was stored; now is the
    // only moment the plaintext is available to upgrade it.
    if (needsRehash(user.passwordHash)) {
      await this.#users.update(user.id, {
        passwordHash: await hashPassword(input.password),
        updatedAt: this.#clock.timestamp(),
      });
    }

    return ok(await this.#startSession(user, context.userAgent ?? null));
  }

  /* ---------------------------------------------------------------------- */
  /* Reading the current actor                                              */
  /* ---------------------------------------------------------------------- */

  /**
   * Resolve a cookie value into the signed-in user, or null.
   *
   * An expired, revoked or forged token is simply "signed out" - never an
   * error the caller has to handle, so no route can accidentally treat a bad
   * token as a valid one.
   */
  async currentUser(token: string | undefined | null): Promise<{ user: User; session: Session } | null> {
    if (!token) return null;

    const session = await this.#sessions.findByTokenHash(hashSessionToken(token, this.#secret));
    if (!session) return null;

    const nowMs = this.#clock.now();
    if (isSessionExpired(session, nowMs)) {
      await this.#sessions.delete(session.id);
      return null;
    }

    const user = await this.#users.findById(session.userId);
    if (!user) {
      // The account is gone; its sessions must not outlive it.
      await this.#sessions.delete(session.id);
      return null;
    }

    if (user.suspendedAt) {
      await this.#sessions.deleteAllForUser(user.id);
      return null;
    }

    await this.#sessions.touch(session.id, this.#clock.timestamp());
    return { user, session };
  }

  /** The actor every authorisation check is made against. */
  async actorFor(token: string | undefined | null): Promise<Actor> {
    const current = await this.currentUser(token);
    if (!current) return ANONYMOUS;
    return {
      userId: current.user.id,
      platformRoles: current.user.roles,
      suspended: current.user.suspendedAt !== null,
    };
  }

  /* ---------------------------------------------------------------------- */
  /* Sign out                                                               */
  /* ---------------------------------------------------------------------- */

  async signOut(token: string | undefined | null): Promise<void> {
    if (!token) return;
    const session = await this.#sessions.findByTokenHash(hashSessionToken(token, this.#secret));
    if (session) await this.#sessions.delete(session.id);
  }

  /** Sign out everywhere. Used after a password change or a compromise. */
  async signOutEverywhere(userId: UserId): Promise<number> {
    return this.#sessions.deleteAllForUser(userId);
  }

  /* ---------------------------------------------------------------------- */
  /* Profiles                                                               */
  /* ---------------------------------------------------------------------- */

  async findByHandle(handle: string): Promise<User | null> {
    return this.#users.findByHandleKey(normaliseHandle(handle));
  }

  /**
   * Update a profile.
   *
   * Takes the actor rather than assuming the caller checked: the ownership
   * rule lives with the operation, so a new entry point cannot forget it.
   */
  async updateProfile(
    actor: Actor,
    targetUserId: UserId,
    input: UpdateProfileInput,
  ): Promise<Result<User, FluxError>> {
    if (!actor.userId) return err(new UnauthenticatedError());
    if (actor.userId !== targetUserId) {
      return err(new ForbiddenError('You can only edit your own profile.'));
    }

    const user = await this.#users.findById(targetUserId);
    if (!user) return err(new NotFoundError('account'));

    const updated = await this.#users.update(targetUserId, {
      profile: {
        ...user.profile,
        displayName: input.displayName,
        bio: input.bio,
        location: input.location,
        links: input.links,
      },
      updatedAt: this.#clock.timestamp(),
    });

    return updated ? ok(updated) : err(new NotFoundError('account'));
  }

  /* ---------------------------------------------------------------------- */
  /* Administration                                                         */
  /* ---------------------------------------------------------------------- */

  /**
   * Suspend an account and end its sessions immediately.
   *
   * Revocation is the whole reason sessions are server-side: a suspended user
   * must lose access now, not when a token happens to expire.
   */
  async suspend(actor: Actor, targetUserId: UserId): Promise<Result<User, FluxError>> {
    if (!actor.platformRoles.includes('admin') && !actor.platformRoles.includes('moderator')) {
      return err(new ForbiddenError('Only moderators can suspend an account.'));
    }
    if (actor.userId === targetUserId) {
      return err(new InvalidInputError('You cannot suspend your own account.'));
    }

    const updated = await this.#users.update(targetUserId, {
      suspendedAt: this.#clock.timestamp(),
      updatedAt: this.#clock.timestamp(),
    });
    if (!updated) return err(new NotFoundError('account'));

    await this.#sessions.deleteAllForUser(targetUserId);
    return ok(updated);
  }

  /* ---------------------------------------------------------------------- */

  async #startSession(user: User, userAgent: string | null): Promise<SignedIn> {
    const token = createSessionToken();
    const now = this.#clock.now();

    const session = await this.#sessions.create({
      id: createId<'session'>() as SessionId,
      userId: user.id,
      tokenHash: hashSessionToken(token, this.#secret),
      createdAt: new Date(now).toISOString(),
      lastSeenAt: new Date(now).toISOString(),
      expiresAt: new Date(now + SESSION_LIFETIME_MS).toISOString(),
      userAgent,
    });

    return { user, session, token };
  }
}
