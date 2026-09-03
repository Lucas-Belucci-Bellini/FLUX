/**
 * The failure vocabulary of the whole platform.
 *
 * Every layer speaks these codes, and only the HTTP edge translates them into
 * status codes. That keeps domain code free of transport concerns while still
 * giving the API a single, predictable mapping.
 */

export const ERROR_CODES = [
  'unauthenticated',
  'forbidden',
  'not_found',
  'conflict',
  'invalid',
  'rate_limited',
  'unavailable',
  'internal',
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

const STATUS_BY_CODE: Record<ErrorCode, number> = {
  unauthenticated: 401,
  forbidden: 403,
  not_found: 404,
  conflict: 409,
  invalid: 422,
  rate_limited: 429,
  unavailable: 503,
  internal: 500,
};

/** Extra machine-readable context. Must never carry secrets — it reaches clients. */
export type ErrorDetails = Record<string, unknown>;

export class FluxError extends Error {
  readonly code: ErrorCode;
  readonly details: ErrorDetails;

  constructor(code: ErrorCode, message: string, details: ErrorDetails = {}) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.details = details;
  }

  get status(): number {
    return STATUS_BY_CODE[this.code];
  }

  /** The safe, client-facing shape. Stack traces and causes stay on the server. */
  toJSON(): { code: ErrorCode; message: string; details: ErrorDetails } {
    return { code: this.code, message: this.message, details: this.details };
  }
}

export class UnauthenticatedError extends FluxError {
  constructor(message = 'Sign in to continue.', details?: ErrorDetails) {
    super('unauthenticated', message, details);
  }
}

export class ForbiddenError extends FluxError {
  constructor(message = 'You do not have permission to do that.', details?: ErrorDetails) {
    super('forbidden', message, details);
  }
}

export class NotFoundError extends FluxError {
  constructor(what = 'resource', details?: ErrorDetails) {
    super('not_found', `That ${what} does not exist.`, details);
  }
}

export class ConflictError extends FluxError {
  constructor(message = 'That conflicts with something that already exists.', details?: ErrorDetails) {
    super('conflict', message, details);
  }
}

export class InvalidInputError extends FluxError {
  constructor(message = 'That input is not valid.', details?: ErrorDetails) {
    super('invalid', message, details);
  }
}

export class RateLimitedError extends FluxError {
  constructor(retryAfterSeconds: number, message = 'Too many requests. Slow down.') {
    super('rate_limited', message, { retryAfterSeconds });
  }
}

/** Narrow an unknown thrown value into a FluxError without losing information. */
export function toFluxError(cause: unknown): FluxError {
  if (cause instanceof FluxError) return cause;
  if (cause instanceof Error) {
    return new FluxError('internal', cause.message, { name: cause.name });
  }
  return new FluxError('internal', 'Unexpected failure.', { cause: String(cause) });
}
