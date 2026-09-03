/**
 * Time is an input, not an ambient fact.
 *
 * Anything that needs "now" takes a Clock. Tests then pin time down instead of
 * sleeping, and feed ordering stays reproducible.
 */

export interface Clock {
  /** Milliseconds since the Unix epoch. */
  now(): number;
  /** The same instant, as an ISO-8601 string — the format every entity stores. */
  timestamp(): string;
}

export const systemClock: Clock = {
  now: () => Date.now(),
  timestamp: () => new Date(Date.now()).toISOString(),
};

export interface TestClock extends Clock {
  /** Move time forward by `ms`. */
  advance(ms: number): void;
  /** Jump to an absolute instant. */
  set(ms: number): void;
}

/** A clock that only moves when a test tells it to. */
export function testClock(startMs = Date.UTC(2026, 0, 1, 0, 0, 0)): TestClock {
  let current = startMs;
  return {
    now: () => current,
    timestamp: () => new Date(current).toISOString(),
    advance: (ms: number) => {
      current += ms;
    },
    set: (ms: number) => {
      current = ms;
    },
  };
}
