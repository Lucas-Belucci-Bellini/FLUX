/**
 * The internal event bus.
 *
 * Modules announce facts; they do not call each other. A video does not know
 * that notifications, search indexing and recommendation all care when it is
 * published — it emits `video:published` and moves on. That is what keeps
 * eleven feature areas from collapsing into one tangled module.
 *
 * Subscriptions accept wildcards: `video:*` for one area, `*` for everything
 * (audit logs, the dev inspector).
 */

import { type Clock, systemClock } from './clock';

/**
 * The catalogue of everything the platform announces.
 *
 * Adding an event means adding it here first — one place to read to know what
 * the system can tell you, and the payloads are type-checked at both ends.
 */
export interface FluxEventMap {
  'user:registered': { userId: string; handle: string };
  'user:followed': { followerId: string; followeeId: string };

  'video:published': { videoId: string; creatorId: string; communityId?: string };
  'video:viewed': { videoId: string; viewerId: string | null; secondsWatched: number };
  'video:liked': { videoId: string; userId: string };

  'short:published': { shortId: string; creatorId: string };

  'comment:created': { commentId: string; parentId: string | null; targetKind: string; targetId: string };

  'community:created': { communityId: string; ownerId: string; parentId: string | null };
  'community:joined': { communityId: string; userId: string };

  'post:created': { postId: string; communityId: string; authorId: string };
  'post:voted': { postId: string; userId: string; value: 1 | -1 | 0 };

  'live:started': { liveId: string; creatorId: string };
  'live:ended': { liveId: string; creatorId: string; peakViewers: number };

  'track:played': { trackId: string; userId: string | null };

  'product:created': { productId: string; storeId: string };
  'order:created': { orderId: string; buyerId: string; totalCents: number };

  'moderation:actioned': { actionId: string; moderatorId: string; targetKind: string; targetId: string };
}

export type FluxEventName = keyof FluxEventMap & string;

/**
 * The same catalogue, available at runtime for the diagnostics page and for
 * validating event names arriving from outside the process.
 */
export const FLUX_EVENT_NAMES = [
  'user:registered',
  'user:followed',
  'video:published',
  'video:viewed',
  'video:liked',
  'short:published',
  'comment:created',
  'community:created',
  'community:joined',
  'post:created',
  'post:voted',
  'live:started',
  'live:ended',
  'track:played',
  'product:created',
  'order:created',
  'moderation:actioned',
] as const satisfies readonly FluxEventName[];

/**
 * Compile-time guard: adding an event to FluxEventMap without listing it above
 * turns this into an error naming exactly which one is missing.
 */
type MissingFromCatalogue = Exclude<FluxEventName, (typeof FLUX_EVENT_NAMES)[number]>;
const _catalogueIsComplete: MissingFromCatalogue extends never ? true : never = true;
void _catalogueIsComplete;

export function isFluxEventName(value: unknown): value is FluxEventName {
  return typeof value === 'string' && (FLUX_EVENT_NAMES as readonly string[]).includes(value);
}

/** Context handed to every listener alongside the payload. */
export interface EventMeta<N extends FluxEventName = FluxEventName> {
  /** The concrete event name — the piece a wildcard listener would otherwise lose. */
  readonly event: N;
  /** When it was emitted, ISO-8601. */
  readonly at: string;
}

export type Listener<N extends FluxEventName> = (
  payload: FluxEventMap[N],
  meta: EventMeta<N>,
) => void | Promise<void>;

type AnyListener = (payload: never, meta: EventMeta) => void | Promise<void>;

/** `video:*` matches `video:published`; `*` matches everything. */
export type Pattern = FluxEventName | '*' | `${string}:*`;

export function patternMatches(pattern: Pattern, event: FluxEventName): boolean {
  if (pattern === '*') return true;
  if (pattern.endsWith(':*')) return event.startsWith(pattern.slice(0, -1));
  return pattern === event;
}

export type Unsubscribe = () => void;

export interface EventBusOptions {
  clock?: Clock;
  /**
   * Where a listener's failure goes. A broken notification listener must not
   * take down the request that published the video.
   */
  onListenerError?: (error: unknown, event: FluxEventName) => void;
}

export class EventBus {
  readonly #listeners = new Map<Pattern, Set<AnyListener>>();
  readonly #clock: Clock;
  readonly #onListenerError: (error: unknown, event: FluxEventName) => void;

  constructor(options: EventBusOptions = {}) {
    this.#clock = options.clock ?? systemClock;
    this.#onListenerError =
      options.onListenerError ??
      ((error, event) => {
        console.error(`[flux] listener for "${event}" failed`, error);
      });
  }

  /** Subscribe to one event, one area (`music:*`) or everything (`*`). */
  on<N extends FluxEventName>(pattern: N, listener: Listener<N>): Unsubscribe;
  on(pattern: '*' | `${string}:*`, listener: Listener<FluxEventName>): Unsubscribe;
  on(pattern: Pattern, listener: AnyListener): Unsubscribe {
    const set = this.#listeners.get(pattern) ?? new Set<AnyListener>();
    set.add(listener);
    this.#listeners.set(pattern, set);
    return () => {
      set.delete(listener);
      if (set.size === 0) this.#listeners.delete(pattern);
    };
  }

  /** Subscribe until the first matching event, then unsubscribe. */
  once<N extends FluxEventName>(pattern: N, listener: Listener<N>): Unsubscribe {
    const off = this.on(pattern, ((payload, meta) => {
      off();
      return listener(payload as FluxEventMap[N], meta as EventMeta<N>);
    }) as Listener<N>);
    return off;
  }

  /**
   * Announce a fact.
   *
   * Listeners run in subscription order and their failures are contained:
   * emitting never throws because a subscriber misbehaved.
   */
  async emit<N extends FluxEventName>(event: N, payload: FluxEventMap[N]): Promise<void> {
    const meta: EventMeta<N> = { event, at: this.#clock.timestamp() };
    for (const [pattern, listeners] of this.#listeners) {
      if (!patternMatches(pattern, event)) continue;
      for (const listener of [...listeners]) {
        try {
          await (listener as unknown as Listener<N>)(payload, meta);
        } catch (error) {
          this.#onListenerError(error, event);
        }
      }
    }
  }

  /** How many listeners would run for this event. Diagnostics only. */
  listenerCount(event: FluxEventName): number {
    let count = 0;
    for (const [pattern, listeners] of this.#listeners) {
      if (patternMatches(pattern, event)) count += listeners.size;
    }
    return count;
  }

  clear(): void {
    this.#listeners.clear();
  }
}
