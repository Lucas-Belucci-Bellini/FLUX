import 'server-only';

import { NextResponse } from 'next/server';
import type { z } from 'zod';

import { type FluxError, type Result, toFluxError } from '@flux/core';
import { fieldErrors } from '@flux/identity';

/**
 * The HTTP edge.
 *
 * Domain code speaks `Result` and `FluxError`; only this file knows about
 * status codes and JSON envelopes. That mapping existing once is what stops
 * one endpoint answering 403 where another answers 401 for the same refusal.
 */

export interface ApiErrorBody {
  readonly code: string;
  readonly message: string;
  readonly details: Record<string, unknown>;
}

export function apiError(error: unknown): NextResponse<ApiErrorBody> {
  const fluxError = toFluxError(error);

  // Unexpected failures are logged in full and answered with nothing useful to
  // an attacker: an internal message can carry a query, a path or a hostname.
  if (fluxError.code === 'internal') {
    console.error('[flux] unhandled error at the API edge', error);
    return NextResponse.json(
      { code: 'internal', message: 'Something went wrong.', details: {} },
      { status: 500 },
    );
  }

  const response = NextResponse.json(fluxError.toJSON(), { status: fluxError.status });
  if (fluxError.code === 'rate_limited') {
    const retryAfter = fluxError.details.retryAfterSeconds;
    if (typeof retryAfter === 'number') {
      response.headers.set('Retry-After', String(retryAfter));
    }
  }
  return response;
}

export function apiOk<T>(data: T, status = 200): NextResponse<T> {
  return NextResponse.json(data, { status });
}

/** Turn a domain `Result` into a response without a branch at every call site. */
export function apiResult<T>(result: Result<T, FluxError>, status = 200): NextResponse {
  return result.ok ? apiOk(result.value, status) : apiError(result.error);
}

/**
 * Parse a JSON body against a schema.
 *
 * A malformed body is a 422 with the offending fields, never an unhandled
 * throw, and never a value that reaches domain code unchecked.
 */
export async function parseJsonBody<S extends z.ZodType>(
  request: Request,
  schema: S,
): Promise<{ ok: true; data: z.infer<S> } | { ok: false; response: NextResponse }> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { code: 'invalid', message: 'Expected a JSON body.', details: {} },
        { status: 400 },
      ),
    };
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          code: 'invalid',
          message: 'Some fields need attention.',
          details: { fields: fieldErrors(parsed.error) },
        },
        { status: 422 },
      ),
    };
  }

  return { ok: true, data: parsed.data };
}
