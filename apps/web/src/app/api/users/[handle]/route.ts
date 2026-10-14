import { NotFoundError } from '@flux/core';
import { publicProfile } from '@flux/identity';

import { apiError, apiOk } from '@/lib/api';
import { container } from '@/lib/container';

/** GET /api/users/:handle - a public profile. */
export async function GET(_request: Request, { params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const user = await container().identity.findByHandle(handle);

  // A suspended account answers 404 rather than "suspended": whether one
  // exists is not information a stranger needs.
  if (!user || user.suspendedAt) return apiError(new NotFoundError('profile'));

  return apiOk({ user: publicProfile(user) });
}
