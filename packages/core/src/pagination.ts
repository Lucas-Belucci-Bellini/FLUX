/**
 * Cursor pagination.
 *
 * Offset pagination makes the database scan everything it skips, and silently
 * duplicates or drops rows when the list changes underneath the reader - both
 * fatal for an infinite feed. Every list in FLUX is a cursor page, and no
 * endpoint may return an unbounded collection.
 */

import { FluxError } from './errors';

export const DEFAULT_PAGE_SIZE = 24;
export const MAX_PAGE_SIZE = 100;

export interface PageRequest {
  /** Opaque position from a previous page. Absent means "from the start". */
  readonly cursor?: string;
  readonly limit: number;
}

export interface Page<T> {
  readonly items: readonly T[];
  /** Pass back as `cursor` to continue. `null` means the list is exhausted. */
  readonly nextCursor: string | null;
}

export function emptyPage<T>(): Page<T> {
  return { items: [], nextCursor: null };
}

/**
 * A cursor is a sort key plus the id that produced it. Carrying the id breaks
 * ties deterministically when many rows share a timestamp.
 */
export interface Cursor {
  readonly key: string;
  readonly id: string;
}

export function encodeCursor(cursor: Cursor): string {
  // JSON rather than a delimiter: sort keys are arbitrary strings (a title, a
  // timestamp with a space in it) and must survive the round trip untouched.
  return Buffer.from(JSON.stringify([cursor.key, cursor.id]), 'utf8').toString('base64url');
}

export function decodeCursor(raw: string): Cursor {
  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
  } catch {
    throw new FluxError('invalid', 'Malformed cursor.');
  }
  if (
    !Array.isArray(parsed) ||
    parsed.length !== 2 ||
    typeof parsed[0] !== 'string' ||
    typeof parsed[1] !== 'string'
  ) {
    throw new FluxError('invalid', 'Malformed cursor.');
  }
  return { key: parsed[0], id: parsed[1] };
}

/**
 * Normalise untrusted paging input.
 *
 * A client asking for a million rows gets `MAX_PAGE_SIZE`, not a million rows
 * and not an error - clamping keeps well-meaning clients working while still
 * bounding the query.
 */
export function parsePageRequest(input: {
  cursor?: string | null;
  limit?: string | number | null;
}): PageRequest {
  const rawLimit = typeof input.limit === 'string' ? Number(input.limit) : input.limit;
  const limit =
    rawLimit == null || !Number.isFinite(rawLimit)
      ? DEFAULT_PAGE_SIZE
      : Math.min(Math.max(Math.trunc(rawLimit), 1), MAX_PAGE_SIZE);

  return input.cursor ? { cursor: input.cursor, limit } : { limit };
}

/**
 * Page an already-sorted array. In-memory adapters and tests use this; the
 * PostgreSQL adapters express the same semantics as a WHERE clause.
 *
 * `sortKey` must agree with the array's existing order.
 */
export function paginate<T>(
  sorted: readonly T[],
  request: PageRequest,
  sortKey: (item: T) => Cursor,
): Page<T> {
  let start = 0;
  if (request.cursor) {
    const cursor = decodeCursor(request.cursor);
    const index = sorted.findIndex((item) => {
      const candidate = sortKey(item);
      return candidate.key === cursor.key && candidate.id === cursor.id;
    });
    // An unknown cursor points at something that was deleted or filtered away.
    // Restarting is friendlier than a hard failure on a feed the reader can see.
    start = index < 0 ? 0 : index + 1;
  }

  const items = sorted.slice(start, start + request.limit);
  const exhausted = start + items.length >= sorted.length;
  const last = items.at(-1);

  return {
    items,
    nextCursor: exhausted || !last ? null : encodeCursor(sortKey(last)),
  };
}

/** Map a page's items while keeping its cursor. */
export function mapPage<T, U>(page: Page<T>, fn: (item: T) => U): Page<U> {
  return { items: page.items.map(fn), nextCursor: page.nextCursor };
}
