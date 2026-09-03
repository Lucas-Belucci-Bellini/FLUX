/**
 * Password hashing.
 *
 * scrypt from `node:crypto` - deliberately not argon2 or bcrypt, because both
 * are native modules that have to compile on every machine and in every CI
 * image. scrypt is memory-hard, is in the standard library, and the parameters
 * below put a single verification at roughly 100ms, which is the point: slow
 * enough to make an offline guessing attack expensive, fast enough that a
 * sign-in still feels instant.
 *
 * Server-side only. Nothing here may be imported into browser code.
 */

import { type ScryptOptions, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

// promisify() resolves to scrypt's three-argument overload and loses the one
// that takes cost parameters, so the signature is restated here.
const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: ScryptOptions,
) => Promise<Buffer>;

/**
 * Cost parameters, stored alongside every hash so they can be raised later
 * without invalidating existing passwords - an old hash keeps verifying with
 * the parameters it was made with.
 */
const COST = 2 ** 15; // N
const BLOCK_SIZE = 8; // r
const PARALLELISM = 1; // p
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

/** scrypt needs roughly 128 * N * r bytes; the default cap is too low for N = 2^15. */
const MAX_MEMORY = 128 * COST * BLOCK_SIZE * 2;

export const PASSWORD_MIN_LENGTH = 10;
export const PASSWORD_MAX_LENGTH = 200;

/**
 * A password long enough to be worth hashing.
 *
 * Length is the only rule. Composition rules ("one uppercase, one symbol")
 * push people towards `Password1!` and are worse than a long passphrase; the
 * upper bound exists so nobody can post a megabyte and tie up a core.
 */
export function validatePasswordStrength(password: string): { ok: true } | { ok: false; message: string } {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return { ok: false, message: `Use at least ${PASSWORD_MIN_LENGTH} characters.` };
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return { ok: false, message: `Use at most ${PASSWORD_MAX_LENGTH} characters.` };
  }
  return { ok: true };
}

/**
 * `scrypt$N$r$p$salt$hash`, base64url for both binary parts.
 *
 * Self-describing, so the verifier never has to guess which parameters were
 * used, and a future algorithm can be added by changing the prefix.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const derived = await scryptAsync(password.normalize('NFKC'), salt, KEY_LENGTH, {
    N: COST,
    r: BLOCK_SIZE,
    p: PARALLELISM,
    maxmem: MAX_MEMORY,
  });

  return [
    'scrypt',
    COST,
    BLOCK_SIZE,
    PARALLELISM,
    salt.toString('base64url'),
    derived.toString('base64url'),
  ].join('$');
}

/**
 * Verify a password against a stored hash.
 *
 * Never throws and never distinguishes "no such user" from "wrong password" to
 * its caller: a malformed or missing hash returns false like any other
 * mismatch, so failures cannot be used to enumerate accounts.
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;

  const [, costRaw, blockRaw, parallelRaw, saltRaw, hashRaw] = parts;
  const cost = Number(costRaw);
  const blockSize = Number(blockRaw);
  const parallelism = Number(parallelRaw);

  if (!Number.isInteger(cost) || !Number.isInteger(blockSize) || !Number.isInteger(parallelism)) {
    return false;
  }
  // A hostile row must not be able to ask for unbounded memory.
  if (cost > 2 ** 20 || blockSize > 32 || parallelism > 16) return false;

  try {
    const salt = Buffer.from(saltRaw ?? '', 'base64url');
    const expected = Buffer.from(hashRaw ?? '', 'base64url');
    if (salt.length === 0 || expected.length === 0) return false;

    const derived = await scryptAsync(password.normalize('NFKC'), salt, expected.length, {
      N: cost,
      r: blockSize,
      p: parallelism,
      maxmem: 128 * cost * blockSize * 2,
    });

    return derived.length === expected.length && timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

/** True when a stored hash was made with weaker parameters and should be re-hashed on next sign-in. */
export function needsRehash(stored: string): boolean {
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return true;
  return Number(parts[1]) < COST || Number(parts[2]) < BLOCK_SIZE;
}
