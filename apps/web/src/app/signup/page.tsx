import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { HANDLE_MAX_LENGTH, HANDLE_MIN_LENGTH, PASSWORD_MIN_LENGTH } from '@flux/identity';

import { registerAction } from '@/app/actions/auth';
import { AuthForm } from '@/components/AuthForm';
import { currentUser } from '@/lib/auth';

export const metadata: Metadata = { title: 'Create your account' };

export default async function SignUpPage() {
  // Already signed in: sending someone to a signup form they cannot use is a
  // dead end, so send them home instead.
  if (await currentUser()) redirect('/');

  return (
    <div className="flex flex-col items-center gap-6 py-10">
      <div className="flex max-w-md flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-ink">Join FLUX</h1>
        <p className="text-sm text-ink-muted">
          One account for videos, communities, music, live and the shop.
        </p>
      </div>

      <AuthForm
        action={registerAction}
        submitLabel="Create account"
        fields={[
          {
            name: 'handle',
            label: 'Handle',
            autoComplete: 'username',
            hint: `${HANDLE_MIN_LENGTH}-${HANDLE_MAX_LENGTH} characters: letters, numbers and underscores, starting with a letter.`,
          },
          { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
          {
            name: 'password',
            label: 'Password',
            type: 'password',
            autoComplete: 'new-password',
            hint: `At least ${PASSWORD_MIN_LENGTH} characters. A passphrase beats a short complicated one.`,
          },
        ]}
        footer={
          <>
            Already have an account?{' '}
            <Link href="/signin" className="text-accent hover:underline">
              Sign in
            </Link>
          </>
        }
      />
    </div>
  );
}
