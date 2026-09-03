import type { NextRequest } from 'next/server';

import { selfProfile, signInSchema } from '@flux/identity';

import { apiError, apiOk, parseJsonBody } from '@/lib/api';
import { clearSessionCookie, currentUser, rawSessionToken, setSessionCookie } from '@/lib/auth';
import { container } from '@/lib/container';

/** GET /api/auth/session - who am I? */
export async function GET() {
  const user = await currentUser();
  return apiOk({ user: user ? selfProfile(user) : null });
}

/** POST /api/auth/session - sign in. */
export async function POST(request: NextRequest) {
  const body = await parseJsonBody(request, signInSchema);
  if (!body.ok) return body.response;

  const result = await container().identity.signIn(body.data, {
    userAgent: request.headers.get('user-agent'),
  });
  if (!result.ok) return apiError(result.error);

  await setSessionCookie(result.value.token);
  return apiOk({ user: selfProfile(result.value.user) });
}

/** DELETE /api/auth/session - sign out this session only. */
export async function DELETE() {
  await container().identity.signOut(await rawSessionToken());
  await clearSessionCookie();
  return apiOk({ signedOut: true });
}
