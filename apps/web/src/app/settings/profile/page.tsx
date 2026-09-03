import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { updateProfileAction } from '@/app/actions/auth';
import { ProfileForm } from '@/components/ProfileForm';
import { currentUser } from '@/lib/auth';

export const metadata: Metadata = { title: 'Edit profile' };

export default async function EditProfilePage() {
  const user = await currentUser();
  // Guarded here and again in the action. The page check is a courtesy; the
  // action check is the control.
  if (!user) redirect('/signin');

  return (
    <div className="flex max-w-2xl flex-col gap-6 py-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-ink">Edit profile</h1>
        <p className="text-sm text-ink-muted">
          This is what everyone else sees. Your email stays private.
        </p>
      </header>

      <ProfileForm
        action={updateProfileAction}
        handle={user.handle}
        initial={{
          displayName: user.profile.displayName,
          bio: user.profile.bio,
          location: user.profile.location ?? '',
        }}
      />
    </div>
  );
}
