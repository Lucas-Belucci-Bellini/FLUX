import { describe, expect, it } from 'vitest';

import { ID_LENGTH, createId, createIdFactory, idTimestamp, isId, parseId } from './id';

describe('id', () => {
  it('mints ids of the documented length and alphabet', () => {
    const id = createId<'video'>();
    expect(id).toHaveLength(ID_LENGTH);
    expect(id).toMatch(/^[0-9ABCDEFGHJKMNPQRSTVWXYZ]{26}$/);
    expect(isId(id)).toBe(true);
  });

  it('rejects lookalikes', () => {
    expect(isId('')).toBe(false);
    expect(isId('too-short')).toBe(false);
    // I, L, O and U are excluded from Crockford base32 precisely because they
    // are read back wrong by humans.
    expect(isId('IIIIIIIIIIIIIIIIIIIIIIIIII')).toBe(false);
    expect(isId(12345)).toBe(false);
  });

  it('sorts lexicographically in creation order', () => {
    let now = 1_700_000_000_000;
    const nextId = createIdFactory(() => now);

    const first = nextId();
    now += 1;
    const second = nextId();
    now += 1_000;
    const third = nextId();

    expect([third, first, second].sort()).toEqual([first, second, third]);
  });

  it('stays strictly increasing inside a single millisecond', () => {
    const nextId = createIdFactory(() => 1_700_000_000_000);
    const ids = Array.from({ length: 500 }, () => nextId());

    expect(new Set(ids).size).toBe(ids.length);
    expect([...ids].sort()).toEqual(ids);
  });

  it('round-trips the creation instant', () => {
    const when = 1_712_345_678_901;
    const id = createIdFactory(() => when)();
    expect(idTimestamp(id)).toBe(when);
  });

  it('refuses untrusted input at the boundary', () => {
    expect(() => parseId('../../etc/passwd', 'video')).toThrow(/not a valid video id/i);
    const good = createId<'video'>();
    expect(parseId(good, 'video')).toBe(good);
  });
});
