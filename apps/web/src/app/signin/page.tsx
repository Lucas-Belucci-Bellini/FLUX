import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { signInAction } from '@/app/actions/auth';
import { AuthForm } from '@/components/AuthForm';
import { currentUser } from '@/lib/auth';

export const metadata: Metadata = { title: 'Sign in' };

export default async function SignInPage() {
  if (await currentUser()) redirect('/');

  return (
    <div className="flex flex-col items-center gap-6 py-10">
      <div className="flex max-w-md flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-ink">Welcome back</h1>
        <p className="text-sm text-ink-muted">Sign in with your handle or your email.</p>
      </div>

      <AuthForm
        action={signInAction}
        submitLabel="Sign in"
        fields={[
          { name: 'identifier', label: 'Handle or email', autoComplete: 'username' },
          { name: 'password', label: 'Password', type: 'password', autoComplete: 'current-password' },
        ]}
        footer={
          <>
            New here?{' '}
            <Link href="/signup" className="text-accent hover:underline">
              Create an account
            </Link>
          </>
        }
      />
    </div>
  );
}
