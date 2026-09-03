import { describe, expect, it, vi } from 'vitest';

import { testClock } from './clock';
import { EventBus, patternMatches } from './events';

describe('patternMatches', () => {
  it('matches exact names, area wildcards and the catch-all', () => {
    expect(patternMatches('video:published', 'video:published')).toBe(true);
    expect(patternMatches('video:published', 'video:liked')).toBe(false);
    expect(patternMatches('video:*', 'video:liked')).toBe(true);
    expect(patternMatches('video:*', 'post:created')).toBe(false);
    expect(patternMatches('*', 'order:created')).toBe(true);
  });
});

describe('EventBus', () => {
  it('delivers to exact, area and catch-all subscribers', async () => {
    const bus = new EventBus({ clock: testClock() });
    const exact = vi.fn();
    const area = vi.fn();
    const everything = vi.fn();
    const unrelated = vi.fn();

    bus.on('video:published', exact);
    bus.on('video:*', area);
    bus.on('*', everything);
    bus.on('post:*', unrelated);

    await bus.emit('video:published', { videoId: 'v1', creatorId: 'c1' });

    expect(exact).toHaveBeenCalledOnce();
    expect(area).toHaveBeenCalledOnce();
    expect(everything).toHaveBeenCalledOnce();
    expect(unrelated).not.toHaveBeenCalled();
  });

  it('tells wildcard listeners which event actually fired', async () => {
    const clock = testClock(Date.UTC(2026, 4, 1));
    const bus = new EventBus({ clock });
    const seen: string[] = [];
    bus.on('*', (_payload, meta) => {
      seen.push(`${meta.event}@${meta.at}`);
    });

    await bus.emit('live:started', { liveId: 'l1', creatorId: 'c1' });

    expect(seen).toEqual(['live:started@2026-05-01T00:00:00.000Z']);
  });

  it('contains listener failures so the publisher is unaffected', async () => {
    const onListenerError = vi.fn();
    const bus = new EventBus({ clock: testClock(), onListenerError });
    const after = vi.fn();

    bus.on('video:liked', () => {
      throw new Error('notifications are down');
    });
    bus.on('video:liked', after);

    await expect(bus.emit('video:liked', { videoId: 'v1', userId: 'u1' })).resolves.toBeUndefined();
    expect(onListenerError).toHaveBeenCalledOnce();
    // A broken subscriber must not stop the ones behind it.
    expect(after).toHaveBeenCalledOnce();
  });

  it('awaits async listeners before resolving', async () => {
    const bus = new EventBus({ clock: testClock() });
    let finished = false;
    bus.on('order:created', async () => {
      await Promise.resolve();
      finished = true;
    });

    await bus.emit('order:created', { orderId: 'o1', buyerId: 'u1', totalCents: 1000 });
    expect(finished).toBe(true);
  });

  it('unsubscribes, including from inside once()', async () => {
    const bus = new EventBus({ clock: testClock() });
    const listener = vi.fn();
    const off = bus.on('post:created', listener);
    off();
    await bus.emit('post:created', { postId: 'p1', communityId: 'c1', authorId: 'u1' });
    expect(listener).not.toHaveBeenCalled();

    const onceListener = vi.fn();
    bus.once('post:created', onceListener);
    await bus.emit('post:created', { postId: 'p2', communityId: 'c1', authorId: 'u1' });
    await bus.emit('post:created', { postId: 'p3', communityId: 'c1', authorId: 'u1' });
    expect(onceListener).toHaveBeenCalledOnce();
    expect(bus.listenerCount('post:created')).toBe(0);
  });

  it('mutating subscriptions during dispatch does not skip listeners', async () => {
    const bus = new EventBus({ clock: testClock() });
    const second = vi.fn();
    bus.on('video:viewed', () => {
      bus.on('video:viewed', vi.fn());
    });
    bus.on('video:viewed', second);

    await bus.emit('video:viewed', { videoId: 'v1', viewerId: null, secondsWatched: 3 });
    expect(second).toHaveBeenCalledOnce();
  });
});
