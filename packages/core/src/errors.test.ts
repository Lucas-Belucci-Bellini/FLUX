import { describe, expect, it } from 'vitest';

import {
  ConflictError,
  ERROR_CODES,
  FluxError,
  ForbiddenError,
  NotFoundError,
  RateLimitedError,
  UnauthenticatedError,
  isFluxError,
  toFluxError,
} from './errors';

describe('FluxError', () => {
  it('maps every code to a status', () => {
    for (const code of ERROR_CODES) {
      const status = new FluxError(code, 'x').status;
      expect(status, code).toBeGreaterThanOrEqual(400);
      expect(status, code).toBeLessThan(600);
    }
  });

  it('gives each kind the status its callers expect', () => {
    expect(new UnauthenticatedError().status).toBe(401);
    expect(new ForbiddenError().status).toBe(403);
    expect(new NotFoundError('video').status).toBe(404);
    expect(new ConflictError().status).toBe(409);
    expect(new RateLimitedError(30).status).toBe(429);
  });

  it('serialises without the stack', () => {
    const json = new ConflictError('Taken.', { field: 'handle' }).toJSON();
    expect(json).toEqual({ code: 'conflict', message: 'Taken.', details: { field: 'handle' } });
    expect(JSON.stringify(json)).not.toContain('at ');
  });

  it('carries the retry hint on a rate limit', () => {
    expect(new RateLimitedError(30).details).toEqual({ retryAfterSeconds: 30 });
  });
});

describe('isFluxError', () => {
  it('recognises its own instances', () => {
    expect(isFluxError(new NotFoundError('video'))).toBe(true);
  });

  it('recognises one built by a second copy of this module', () => {
    // A bundler can load @flux/core twice - once in the app layer, once inside
    // a transpiled package - and then instanceof is false across that seam.
    // This is what such an error looks like from the other side.
    const fromAnotherCopy = Object.assign(new Error('Taken.'), {
      fluxError: '@flux/core:FluxError',
      code: 'conflict',
      details: { field: 'handle' },
    });

    expect(isFluxError(fromAnotherCopy)).toBe(true);
    expect(toFluxError(fromAnotherCopy).code).toBe('conflict');
  });

  it('is not fooled by something merely claiming the brand', () => {
    expect(isFluxError({ fluxError: '@flux/core:FluxError', code: 'teleport' })).toBe(false);
    expect(isFluxError({ code: 'conflict' })).toBe(false);
    expect(isFluxError(null)).toBe(false);
    expect(isFluxError('conflict')).toBe(false);
  });
});

describe('toFluxError', () => {
  it('keeps a domain error exactly as it is', () => {
    const original = new ForbiddenError('Nope.');
    expect(toFluxError(original)).toBe(original);
  });

  it('wraps an unexpected error as internal', () => {
    const wrapped = toFluxError(new TypeError('undefined is not a function'));
    expect(wrapped.code).toBe('internal');
    expect(wrapped.status).toBe(500);
  });

  it('wraps a thrown non-error', () => {
    expect(toFluxError('something odd').code).toBe('internal');
    expect(toFluxError(undefined).code).toBe('internal');
  });
});
