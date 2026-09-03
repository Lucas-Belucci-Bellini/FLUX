import { z } from 'zod';

/**
 * The one place the process environment is read.
 *
 * Everywhere else imports `env`, so a missing or malformed variable fails at
 * boot with a message naming it, instead of surfacing as `undefined` three
 * layers down at request time.
 */

/**
 * `next build` runs with NODE_ENV=production but without deployment secrets -
 * they belong to the running container, not to the image. Shape checks still
 * apply during the build; "required in production" is a runtime rule, enforced
 * below by `sessionSecret()`.
 */
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

const urlString = z
  .string()
  .refine((value) => URL.canParse(value), { message: 'must be an absolute URL' });

const schema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    FLUX_APP_URL: urlString.default('http://localhost:3000'),

    /**
     * Unset means the in-memory adapter: FLUX boots and is usable with no
     * database running. Set it and every repository switches to PostgreSQL.
     */
    DATABASE_URL: z.string().min(1).optional(),

    /** Signs session cookies. Required in production - see `sessionSecret()`. */
    FLUX_SESSION_SECRET: z.string().min(32, 'must be at least 32 characters').optional(),
  })
  .superRefine((value, ctx) => {
    if (!isBuildPhase && value.NODE_ENV === 'production' && !value.FLUX_SESSION_SECRET) {
      ctx.addIssue({
        code: 'custom',
        path: ['FLUX_SESSION_SECRET'],
        message: 'is required in production. See .env.example for how to generate one.',
      });
    }
  });

export type Env = z.infer<typeof schema>;

function parseEnv(source: NodeJS.ProcessEnv): Env {
  const result = schema.safeParse(source);
  if (result.success) return result.data;

  const problems = result.error.issues
    .map((issue) => `  ${issue.path.join('.') || '(root)'} ${issue.message}`)
    .join('\n');
  throw new Error(`Invalid environment.\n${problems}\n\nSee .env.example.`);
}

export const env: Env = parseEnv(process.env);

/** True while no DATABASE_URL is configured, so the UI can say so honestly. */
export const usingInMemoryStore = env.DATABASE_URL === undefined;

/**
 * A fixed, obviously-fake key so `npm run dev` works on a clean checkout.
 * It never reaches production: `sessionSecret()` refuses to hand it out there.
 */
const DEVELOPMENT_SESSION_SECRET = 'flux-development-only-session-secret-not-for-production';

/**
 * The signing key, resolved at the moment it is used rather than at import
 * time - which is what lets the production build run without deployment
 * secrets while still refusing to serve a request without them.
 */
export function sessionSecret(): string {
  if (env.FLUX_SESSION_SECRET) return env.FLUX_SESSION_SECRET;
  if (env.NODE_ENV === 'production') {
    throw new Error(
      'FLUX_SESSION_SECRET is required in production. See .env.example for how to generate one.',
    );
  }
  return DEVELOPMENT_SESSION_SECRET;
}
