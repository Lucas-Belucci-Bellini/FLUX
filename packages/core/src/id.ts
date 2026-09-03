/**
 * Sortable, collision-resistant identifiers (ULID layout).
 *
 * 26 Crockford base32 characters: 48 bits of millisecond timestamp followed by
 * 80 bits of randomness. Two properties earn this over a random UUID:
 *
 *  - lexicographic order matches creation order, so feeds and cursors can page
 *    on the primary key without a second sort column;
 *  - they are generated client- or server-side without a round trip, which
 *    matters for optimistic UI (a comment gets its id before it is stored).
 */

import { FluxError } from './errors';

const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; // Crockford base32: no I, L, O, U
const ENCODING_LEN = 32;
const TIME_LEN = 10;
const RANDOM_LEN = 16;
export const ID_LENGTH = TIME_LEN + RANDOM_LEN;

declare const idBrand: unique symbol;

/**
 * An id tagged with the kind of thing it points at. `Id<'video'>` and
 * `Id<'community'>` are both strings at runtime but refuse to be swapped by
 * the type checker — which is the whole point in a graph this connected.
 */
export type Id<K extends string> = string & { readonly [idBrand]: K };

function encodeTime(ms: number): string {
  if (!Number.isInteger(ms) || ms < 0 || ms > 2 ** 48 - 1) {
    throw new FluxError('internal', `Timestamp out of range for an id: ${ms}`);
  }
  let remaining = ms;
  let out = '';
  for (let i = 0; i < TIME_LEN; i++) {
    const mod = remaining % ENCODING_LEN;
    out = ENCODING.charAt(mod) + out;
    remaining = (remaining - mod) / ENCODING_LEN;
  }
  return out;
}

function randomChars(length: number): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = '';
  // 256 is a multiple of 32, so the modulo is uniform — no rejection needed.
  for (const byte of bytes) out += ENCODING.charAt(byte % ENCODING_LEN);
  return out;
}

function incrementRandom(random: string): string {
  const chars = [...random];
  for (let i = chars.length - 1; i >= 0; i--) {
    const index = ENCODING.indexOf(chars[i] ?? '');
    if (index < 0) throw new FluxError('internal', 'Corrupt id state.');
    if (index < ENCODING_LEN - 1) {
      chars[i] = ENCODING.charAt(index + 1);
      return chars.join('');
    }
    chars[i] = ENCODING.charAt(0);
  }
  // Would require 2^80 ids inside one millisecond. Reaching here is a bug.
  throw new FluxError('internal', 'Exhausted id randomness within a single millisecond.');
}

/**
 * A monotonic id factory.
 *
 * Ids created in the same millisecond still come out strictly increasing,
 * so ordering never depends on clock resolution.
 */
export function createIdFactory(now: () => number = Date.now) {
  let lastTime = -1;
  let lastRandom = '';

  return function nextId<K extends string>(): Id<K> {
    const time = now();
    if (time === lastTime) {
      lastRandom = incrementRandom(lastRandom);
    } else {
      lastTime = time;
      lastRandom = randomChars(RANDOM_LEN);
    }
    return (encodeTime(time) + lastRandom) as Id<K>;
  };
}

const defaultFactory = createIdFactory();

/**
 * Mint an id. The kind parameter is a type-level tag only:
 * `createId<'video'>()` is documentation the compiler enforces.
 */
export function createId<K extends string>(): Id<K> {
  return defaultFactory<K>();
}

export function isId(value: unknown): value is Id<string> {
  if (typeof value !== 'string' || value.length !== ID_LENGTH) return false;
  for (const char of value) {
    if (!ENCODING.includes(char)) return false;
  }
  return true;
}

/** Read the creation instant back out of an id, in milliseconds. */
export function idTimestamp(id: string): number {
  if (!isId(id)) throw new FluxError('invalid', `Not a FLUX id: ${id}`);
  let ms = 0;
  for (const char of id.slice(0, TIME_LEN)) {
    ms = ms * ENCODING_LEN + ENCODING.indexOf(char);
  }
  return ms;
}

/**
 * Assert-and-tag an id coming from outside (a URL, a form, a database row).
 * Untrusted strings must pass through here before touching domain code.
 */
export function parseId<K extends string>(value: unknown, kind: K): Id<K> {
  if (!isId(value)) {
    throw new FluxError('invalid', `Not a valid ${kind} id.`, { kind });
  }
  return value as Id<K>;
}
