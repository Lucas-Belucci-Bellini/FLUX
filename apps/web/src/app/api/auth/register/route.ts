import type { NextRequest } from 'next/server';

import { registerSchema, selfProfile } from '@flux/identity';

import { apiError, apiOk, parseJsonBody } from '@/lib/api';
import { setSessionCookie } from '@/lib/auth';
import { container } from '@/lib/container';

/** POST /api/auth/register - create an account and start a session. */
export async function POST(request: NextRequest) {
  const body = await parseJsonBody(request, registerSchema);
  if (!body.ok) return body.response;

  const result = await container().identity.register(body.data);
  if (!result.ok) return apiError(result.error);

  await setSessionCookie(result.value.token);
  // The response carries the profile, never the session token: the token lives
  // in an HttpOnly cookie so that a script cannot read it.
  return apiOk({ user: selfProfile(result.value.user) }, 201);
}
