import { EventBus, testClock, unwrap } from '@flux/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { validateHandle, confusableKey, normaliseHandle } from './handle';
import { InMemorySessionRepository, InMemoryUserRepository } from './memory';
import { hashPassword, needsRehash, verifyPassword } from './password';
import { IdentityService } from './service';
import { SESSION_IDLE_MS, SESSION_LIFETIME_MS, hashSessionToken } from './session';
import { publicProfile, selfProfile, type UserId } from './user';

const SECRET = 'test-secret-at-least-32-characters-long!!';

function build() {
  const clock = testClock();
  const users = new InMemoryUserRepository();
  const sessions = new InMemorySessionRepository();
  const events = new EventBus({ clock });
  const service = new IdentityService({ users, sessions, sessionSecret: SECRET, clock, events });
  return { clock, users, sessions, events, service };
}

const REGISTRATION = {
  handle: 'vector_six',
  email: 'Vector@Example.test',
  password: 'a-long-enough-passphrase',
};

describe('handles', () => {
  it('accepts a reasonable handle and folds it for uniqueness', () => {
    expect(unwrap(validateHandle('Vector_Six'))).toBe('vector_six');
    expect(normaliseHandle('  VECTOR ')).toBe('vector');
  });

  it('rejects handles that break the rules', () => {
    expect(validateHandle('ab').ok).toBe(false); // too short
    expect(validateHandle('a'.repeat(25)).ok).toBe(false); // too long
    expect(validateHandle('9lives').ok).toBe(false); // must start with a letter
    expect(validateHandle('has spaces').ok).toBe(false);
    expect(validateHandle('has-dash').ok).toBe(false);
  });

  it('refuses names the platform keeps for itself', () => {
    for (const reserved of ['admin', 'support', 'settings', 'api', 'flux']) {
      expect(validateHandle(reserved).ok, reserved).toBe(false);
    }
  });

  it('folds handles that read alike, so lookalikes can be caught', () => {
    expect(confusableKey('f1ux')).toBe(confusableKey('flux'));
    expect(confusableKey('supp0rt')).toBe(confusableKey('support'));
    expect(confusableKey('vector')).not.toBe(confusableKey('victor'));
  });
});

describe('passwords', () => {
  it('verifies a correct password and rejects a wrong one', async () => {
    const hash = await hashPassword('correct horse battery staple');
    expect(await verifyPassword('correct horse battery staple', hash)).toBe(true);
    expect(await verifyPassword('wrong horse battery staple', hash)).toBe(false);
  });

  it('salts, so the same password hashes differently every time', async () => {
    const a = await hashPassword('the same password');
    const b = await hashPassword('the same password');
    expect(a).not.toBe(b);
    expect(await verifyPassword('the same password', b)).toBe(true);
  });

  it('never stores the password itself', async () => {
    const hash = await hashPassword('recognisable-secret');
    expect(hash).not.toContain('recognisable-secret');
  });

  it('treats a malformed hash as a mismatch instead of throwing', async () => {
    for (const bad of ['', 'not-a-hash', 'scrypt$1$2$3', 'bcrypt$1$8$1$aaaa$bbbb']) {
      await expect(verifyPassword('anything', bad)).resolves.toBe(false);
    }
  });

  it('refuses a stored hash that asks for absurd memory', async () => {
    const hostile = `scrypt$${2 ** 30}$8$1$AAAA$BBBB`;
    await expect(verifyPassword('anything', hostile)).resolves.toBe(false);
  });

  it('flags hashes made with weaker parameters for re-hashing', async () => {
    expect(needsRehash(await hashPassword('x'.repeat(12)))).toBe(false);
    expect(needsRehash('scrypt$1024$8$1$AAAA$BBBB')).toBe(true);
    expect(needsRehash('garbage')).toBe(true);
  });
});

describe('registration', () => {
  let context: ReturnType<typeof build>;
  beforeEach(() => {
    context = build();
  });

  it('creates an account and signs it in', async () => {
    const result = await context.service.register(REGISTRATION);
    expect(result.ok).toBe(true);
    const { user, token } = unwrap(result);

    expect(user.handle).toBe('vector_six');
    expect(user.handleKey).toBe('vector_six');
    // The email is folded for lookups.
    expect(user.email).toBe('vector@example.test');
    expect(token).toHaveLength(43); // 32 random bytes, base64url
  });

  it('announces the registration', async () => {
    const listener = vi.fn();
    context.events.on('user:registered', listener);
    await context.service.register(REGISTRATION);
    expect(listener).toHaveBeenCalledOnce();
  });

  it('refuses a handle already taken, whatever its casing', async () => {
    await context.service.register(REGISTRATION);
    const second = await context.service.register({
      ...REGISTRATION,
      handle: 'VECTOR_SIX',
      email: 'someone.else@example.test',
    });

    expect(second.ok).toBe(false);
    if (!second.ok) expect(second.error.code).toBe('conflict');
  });

  it('refuses an email already registered, whatever its casing', async () => {
    await context.service.register(REGISTRATION);
    const second = await context.service.register({
      ...REGISTRATION,
      handle: 'another_one',
      email: 'VECTOR@EXAMPLE.TEST',
    });

    expect(second.ok).toBe(false);
    if (!second.ok) expect(second.error.details).toMatchObject({ field: 'email' });
  });

  it('refuses a reserved handle', async () => {
    const result = await context.service.register({ ...REGISTRATION, handle: 'support' });
    expect(result.ok).toBe(false);
  });

  it('makes the first account an admin and everyone after a member', async () => {
    const first = unwrap(await context.service.register(REGISTRATION));
    const second = unwrap(
      await context.service.register({
        handle: 'second_user',
        email: 'second@example.test',
        password: 'another-long-passphrase',
      }),
    );

    expect(first.user.roles).toEqual(['admin']);
    expect(second.user.roles).toEqual(['member']);
  });
});

describe('signing in', () => {
  let context: ReturnType<typeof build>;
  beforeEach(async () => {
    context = build();
    await context.service.register(REGISTRATION);
  });

  it('accepts the handle or the email', async () => {
    const byHandle = await context.service.signIn({
      identifier: 'vector_six',
      password: REGISTRATION.password,
    });
    const byEmail = await context.service.signIn({
      identifier: 'VECTOR@example.test',
      password: REGISTRATION.password,
    });

    expect(byHandle.ok).toBe(true);
    expect(byEmail.ok).toBe(true);
  });

  it('rejects a wrong password', async () => {
    const result = await context.service.signIn({
      identifier: 'vector_six',
      password: 'not the password',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('unauthenticated');
  });

  it('answers identically for an unknown account and a wrong password', async () => {
    const unknown = await context.service.signIn({
      identifier: 'nobody_here',
      password: 'whatever-it-is',
    });
    const wrong = await context.service.signIn({
      identifier: 'vector_six',
      password: 'not the password',
    });

    expect(unknown.ok).toBe(false);
    expect(wrong.ok).toBe(false);
    // Distinguishable messages would turn sign-in into an account-existence oracle.
    if (!unknown.ok && !wrong.ok) {
      expect(unknown.error.message).toBe(wrong.error.message);
      expect(unknown.error.code).toBe(wrong.error.code);
    }
  });

  it('refuses a suspended account', async () => {
    const admin = { userId: 'admin', platformRoles: ['admin'] as const };
    const user = await context.service.findByHandle('vector_six');
    await context.service.suspend({ ...admin, platformRoles: ['admin'] }, user!.id);

    const result = await context.service.signIn({
      identifier: 'vector_six',
      password: REGISTRATION.password,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('forbidden');
  });
});

describe('sessions', () => {
  let context: ReturnType<typeof build>;
  beforeEach(() => {
    context = build();
  });

  it('resolves a valid token to its user', async () => {
    const { token, user } = unwrap(await context.service.register(REGISTRATION));
    const current = await context.service.currentUser(token);
    expect(current?.user.id).toBe(user.id);
  });

  it('stores a hash of the token, never the token', async () => {
    const { token } = unwrap(await context.service.register(REGISTRATION));
    const stored = await context.sessions.findByTokenHash(hashSessionToken(token, SECRET));

    expect(stored).not.toBeNull();
    expect(stored?.tokenHash).not.toBe(token);
    // A database leak alone is not enough: the server secret is also required.
    expect(await context.sessions.findByTokenHash(hashSessionToken(token, 'other-secret'))).toBeNull();
  });

  it('treats a missing, forged or truncated token as signed out', async () => {
    const { token } = unwrap(await context.service.register(REGISTRATION));
    expect(await context.service.currentUser(undefined)).toBeNull();
    expect(await context.service.currentUser('')).toBeNull();
    expect(await context.service.currentUser('forged-token')).toBeNull();
    expect(await context.service.currentUser(token.slice(0, -1))).toBeNull();
  });

  it('expires a session at its absolute lifetime', async () => {
    const { token } = unwrap(await context.service.register(REGISTRATION));
    context.clock.advance(SESSION_LIFETIME_MS + 1000);
    expect(await context.service.currentUser(token)).toBeNull();
  });

  it('expires a session left idle, before its lifetime is up', async () => {
    const { token } = unwrap(await context.service.register(REGISTRATION));
    context.clock.advance(SESSION_IDLE_MS + 1000);
    expect(await context.service.currentUser(token)).toBeNull();
  });

  it('keeps a session alive while it is being used', async () => {
    const { token } = unwrap(await context.service.register(REGISTRATION));

    // Used just inside the idle window, twice, so total elapsed time passes the
    // idle period without reaching the absolute lifetime.
    for (let index = 0; index < 2; index++) {
      context.clock.advance(SESSION_IDLE_MS - 1000);
      expect(await context.service.currentUser(token)).not.toBeNull();
    }
    expect(context.clock.now()).toBeGreaterThan(SESSION_IDLE_MS);
  });

  it('still ends a session at its lifetime, however often it is used', async () => {
    const { token } = unwrap(await context.service.register(REGISTRATION));

    // Kept warm the whole way; the absolute cap is not something use can extend.
    for (let index = 0; index < 40; index++) {
      context.clock.advance(24 * 60 * 60 * 1000);
      await context.service.currentUser(token);
    }

    expect(await context.service.currentUser(token)).toBeNull();
  });

  it('deletes the expired session rather than leaving it to be found again', async () => {
    const { token } = unwrap(await context.service.register(REGISTRATION));
    context.clock.advance(SESSION_LIFETIME_MS + 1000);
    await context.service.currentUser(token);
    expect(context.sessions.size).toBe(0);
  });

  it('signs out only the session that asked', async () => {
    const first = unwrap(await context.service.register(REGISTRATION));
    const second = unwrap(
      await context.service.signIn({ identifier: 'vector_six', password: REGISTRATION.password }),
    );

    await context.service.signOut(first.token);

    expect(await context.service.currentUser(first.token)).toBeNull();
    expect(await context.service.currentUser(second.token)).not.toBeNull();
  });

  it('signs out everywhere when suspended', async () => {
    const { user, token } = unwrap(await context.service.register(REGISTRATION));
    const other = unwrap(
      await context.service.signIn({ identifier: 'vector_six', password: REGISTRATION.password }),
    );

    // A second account does the suspending; you cannot suspend yourself.
    const moderator = unwrap(
      await context.service.register({
        handle: 'the_mod',
        email: 'mod@example.test',
        password: 'yet-another-passphrase',
      }),
    );
    await context.service.suspend(
      { userId: moderator.user.id, platformRoles: ['moderator'] },
      user.id,
    );

    expect(await context.service.currentUser(token)).toBeNull();
    expect(await context.service.currentUser(other.token)).toBeNull();
  });
});

describe('profiles', () => {
  let context: ReturnType<typeof build>;
  beforeEach(() => {
    context = build();
  });

  it('never exposes the email or the password hash publicly', async () => {
    const { user } = unwrap(await context.service.register(REGISTRATION));
    const seen = publicProfile(user) as unknown as Record<string, unknown>;

    expect(seen.email).toBeUndefined();
    expect(seen.passwordHash).toBeUndefined();
    expect(JSON.stringify(seen)).not.toContain('vector@example.test');
    // …while the owner sees their own address.
    expect(selfProfile(user).email).toBe('vector@example.test');
  });

  it('lets the owner edit their profile', async () => {
    const { user } = unwrap(await context.service.register(REGISTRATION));
    const updated = unwrap(
      await context.service.updateProfile(
        { userId: user.id, platformRoles: ['member'] },
        user.id,
        { displayName: 'Vector Six', bio: 'Air RB, mostly.', location: null, links: [] },
      ),
    );

    expect(updated.profile.displayName).toBe('Vector Six');
  });

  it('refuses to let one account edit another', async () => {
    const { user } = unwrap(await context.service.register(REGISTRATION));
    const intruder = unwrap(
      await context.service.register({
        handle: 'someone_else',
        email: 'else@example.test',
        password: 'a-different-passphrase',
      }),
    );

    const result = await context.service.updateProfile(
      { userId: intruder.user.id, platformRoles: ['member'] },
      user.id,
      { displayName: 'Hijacked', bio: '', location: null, links: [] },
    );

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('forbidden');
  });

  it('refuses an anonymous edit', async () => {
    const { user } = unwrap(await context.service.register(REGISTRATION));
    const result = await context.service.updateProfile(
      { userId: null, platformRoles: ['visitor'] },
      user.id,
      { displayName: 'Anon', bio: '', location: null, links: [] },
    );

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('unauthenticated');
  });
});

describe('suspension', () => {
  it('is refused to a member', async () => {
    const context = build();
    const { user } = unwrap(await context.service.register(REGISTRATION));
    const result = await context.service.suspend(
      { userId: 'someone', platformRoles: ['member'] },
      user.id,
    );

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('forbidden');
  });

  it('is refused on yourself, so an admin cannot lock the instance out', async () => {
    const context = build();
    const { user } = unwrap(await context.service.register(REGISTRATION));
    const result = await context.service.suspend(
      { userId: user.id, platformRoles: ['admin'] },
      user.id,
    );

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('invalid');
  });

  it('reports a missing account rather than pretending to succeed', async () => {
    const context = build();
    const result = await context.service.suspend(
      { userId: 'admin', platformRoles: ['admin'] },
      'ZZZZZZZZZZZZZZZZZZZZZZZZZZ' as UserId,
    );

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('not_found');
  });
});
