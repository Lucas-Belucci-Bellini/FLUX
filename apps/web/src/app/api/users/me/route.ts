import type { NextRequest } from 'next/server';

import { selfProfile, updateProfileSchema } from '@flux/identity';

import { apiError, apiOk, apiResult, parseJsonBody } from '@/lib/api';
import { currentActor, requireUser } from '@/lib/auth';
import { container } from '@/lib/container';

/** GET /api/users/me - the signed-in account, including its private fields. */
export async function GET() {
  try {
    const user = await requireUser();
    return apiOk({ user: selfProfile(user) });
  } catch (error) {
    return apiError(error);
  }
}

/** PATCH /api/users/me - edit your own profile. */
export async function PATCH(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await parseJsonBody(request, updateProfileSchema);
    if (!body.ok) return body.response;

    // The service re-checks ownership against the actor rather than trusting
    // that this handler resolved the right user.
    const result = await container().identity.updateProfile(
      await currentActor(),
      user.id,
      body.data,
    );
    return apiResult(result.ok ? { ok: true, value: selfProfile(result.value) } : result);
  } catch (error) {
    return apiError(error);
  }
}
