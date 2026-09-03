/**
 * The input contracts for identity.
 *
 * One schema per payload, used by the browser to give immediate feedback and
 * by the server to decide. The server never trusts the client's result - it
 * re-parses - but sharing the schema means the two cannot disagree about what
 * is valid.
 */

import { z } from 'zod';

import { HANDLE_MAX_LENGTH, HANDLE_MIN_LENGTH } from './handle';
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from './password';

const email = z
  .string()
  .trim()
  .min(3)
  .max(254)
  // Deliberately permissive: the only proof an address works is a message
  // arriving at it. A strict pattern rejects valid addresses and still cannot
  // tell you the mailbox exists.
  .refine((value) => /^[^\s@]+@[^\s@.]+\.[^\s@]+$/.test(value), {
    message: 'That does not look like an email address.',
  });

const password = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters.`)
  .max(PASSWORD_MAX_LENGTH, `Use at most ${PASSWORD_MAX_LENGTH} characters.`);

const handle = z
  .string()
  .trim()
  .min(HANDLE_MIN_LENGTH)
  .max(HANDLE_MAX_LENGTH);

export const registerSchema = z.object({
  handle,
  email,
  password,
  displayName: z.string().trim().min(1).max(50).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const signInSchema = z.object({
  // Accepts a handle or an email; people do not remember which they used.
  identifier: z.string().trim().min(1, 'Enter your handle or email.').max(254),
  password: z.string().min(1, 'Enter your password.').max(PASSWORD_MAX_LENGTH),
});

export type SignInInput = z.infer<typeof signInSchema>;

const profileLink = z.object({
  label: z.string().trim().min(1).max(30),
  url: z
    .string()
    .trim()
    .max(2048)
    .refine(
      (value) => {
        if (!URL.canParse(value)) return false;
        // http(s) only: javascript: and data: URLs in a profile link are an
        // attack, not a preference.
        const protocol = new URL(value).protocol;
        return protocol === 'http:' || protocol === 'https:';
      },
      { message: 'Links must be http or https URLs.' },
    ),
});

export const updateProfileSchema = z.object({
  displayName: z.string().trim().min(1, 'A display name cannot be empty.').max(50),
  bio: z.string().trim().max(500).default(''),
  location: z.string().trim().max(60).nullable().default(null),
  links: z.array(profileLink).max(5).default([]),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/**
 * Turn a Zod failure into the flat `field -> message` map every form renders.
 */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = issue.path.join('.') || 'form';
    out[field] ??= issue.message;
  }
  return out;
}
