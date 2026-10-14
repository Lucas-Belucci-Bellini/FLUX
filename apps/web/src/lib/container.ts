import 'server-only';

import { EventBus, systemClock } from '@flux/core';
import {
  IdentityService,
  InMemorySessionRepository,
  InMemoryUserRepository,
} from '@flux/identity';

import { env, sessionSecret, usingInMemoryStore } from './env';

/**
 * The composition root.
 *
 * The one place adapters are chosen and services are wired. Everything else
 * asks for a service and receives an interface, which is what keeps the
 * in-memory and PostgreSQL paths interchangeable.
 */

export interface Container {
  readonly events: EventBus;
  readonly identity: IdentityService;
  readonly store: 'in-memory' | 'postgresql';
}

function build(): Container {
  const events = new EventBus({ clock: systemClock });

  // Phase 1 ships the in-memory adapters. The PostgreSQL ones implement the
  // same ports; selecting them is a branch here and nothing else changes.
  const users = new InMemoryUserRepository();
  const sessions = new InMemorySessionRepository();

  const identity = new IdentityService({
    users,
    sessions,
    sessionSecret: sessionSecret(),
    clock: systemClock,
    events,
  });

  if (env.NODE_ENV === 'development') {
    // A log line per fact, so the event bus is visible while building on top of it.
    events.on('*', (_payload, meta) => {
      console.info(`[flux] ${meta.event}`);
    });
  }

  return { events, identity, store: usingInMemoryStore ? 'in-memory' : 'postgresql' };
}

/**
 * Held on globalThis, not in a module constant.
 *
 * The dev server re-evaluates modules on every edit; a module-level instance
 * would mean every save silently signs everyone out and empties the store.
 */
const CONTAINER_KEY = Symbol.for('flux.container');

type GlobalWithContainer = typeof globalThis & { [CONTAINER_KEY]?: Container };

export function container(): Container {
  const scope = globalThis as GlobalWithContainer;
  scope[CONTAINER_KEY] ??= build();
  return scope[CONTAINER_KEY];
}
