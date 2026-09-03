import { describe, expect, it } from 'vitest';

import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  type Cursor,
  type Page,
  decodeCursor,
  encodeCursor,
  paginate,
  parsePageRequest,
} from './pagination';

interface Row {
  id: string;
  at: string;
}

const rows: Row[] = Array.from({ length: 10 }, (_, index) => ({
  id: `id-${index}`,
  at: `2026-01-${String(index + 1).padStart(2, '0')}`,
}));

const keyOf = (row: Row): Cursor => ({ key: row.at, id: row.id });

describe('parsePageRequest', () => {
  it('defaults when nothing is supplied', () => {
    expect(parsePageRequest({})).toEqual({ limit: DEFAULT_PAGE_SIZE });
  });

  it('clamps a hostile limit instead of failing', () => {
    expect(parsePageRequest({ limit: 100_000 }).limit).toBe(MAX_PAGE_SIZE);
    expect(parsePageRequest({ limit: 0 }).limit).toBe(1);
    expect(parsePageRequest({ limit: -5 }).limit).toBe(1);
    expect(parsePageRequest({ limit: 'not a number' }).limit).toBe(DEFAULT_PAGE_SIZE);
    expect(parsePageRequest({ limit: '12' }).limit).toBe(12);
  });
});

describe('cursors', () => {
  it('round-trips, including keys containing spaces', () => {
    const cursor = { key: '2026-01-01 12:00:00', id: 'id-1' };
    expect(decodeCursor(encodeCursor(cursor))).toEqual(cursor);
  });

  it('rejects a malformed cursor', () => {
    expect(() => decodeCursor(Buffer.from('nope', 'utf8').toString('base64url'))).toThrow(
      /malformed cursor/i,
    );
  });
});

describe('paginate', () => {
  it('walks the whole list exactly once', () => {
    const seen: string[] = [];
    let cursor: string | null = null;
    let guard = 0;

    do {
      const page: Page<Row> = paginate(rows, cursor ? { cursor, limit: 3 } : { limit: 3 }, keyOf);
      seen.push(...page.items.map((row) => row.id));
      cursor = page.nextCursor;
    } while (cursor && ++guard < 20);

    expect(seen).toEqual(rows.map((row) => row.id));
  });

  it('reports no cursor once the list is exhausted', () => {
    const page = paginate(rows, { limit: 50 }, keyOf);
    expect(page.items).toHaveLength(10);
    expect(page.nextCursor).toBeNull();
  });

  it('reports no cursor when the final page lands exactly on the boundary', () => {
    const first = paginate(rows, { limit: 5 }, keyOf);
    expect(first.nextCursor).not.toBeNull();
    const second = paginate(rows, { cursor: first.nextCursor as string, limit: 5 }, keyOf);
    expect(second.items).toHaveLength(5);
    expect(second.nextCursor).toBeNull();
  });

  it('restarts rather than failing when the cursor row is gone', () => {
    const first = paginate(rows, { limit: 3 }, keyOf);
    const withoutCursorRow = rows.filter((row) => row.id !== 'id-2');
    const page = paginate(
      withoutCursorRow,
      { cursor: first.nextCursor as string, limit: 3 },
      keyOf,
    );
    expect(page.items[0]?.id).toBe('id-0');
  });

  it('handles an empty list', () => {
    const page = paginate([], { limit: 5 }, keyOf);
    expect(page.items).toEqual([]);
    expect(page.nextCursor).toBeNull();
  });
});
