'use server';

import { redirect } from 'next/navigation';

import {
  fieldErrors,
  registerSchema,
  signInSchema,
  updateProfileSchema,
} from '@flux/identity';

import {
  clearSessionCookie,
  currentActor,
  rawSessionToken,
  requireUser,
  setSessionCookie,
} from '@/lib/auth';
import { container } from '@/lib/container';

/**
 * Server actions for identity.
 *
 * They take FormData, so every form works before any JavaScript loads: the
 * browser posts, the server answers. The validation and the authorisation both
 * happen here, on the server, not in the component that renders the form.
 */

export interface FormState {
  readonly errors?: Record<string, string>;
  readonly ok?: boolean;
}

function text(form: FormData, field: string): string {
  const value = form.get(field);
  return typeof value === 'string' ? value : '';
}

export async function registerAction(_previous: FormState, form: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse({
    handle: text(form, 'handle'),
    email: text(form, 'email'),
    password: text(form, 'password'),
    displayName: text(form, 'displayName') || undefined,
  });

  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const result = await container().identity.register(parsed.data);
  if (!result.ok) {
    const field = typeof result.error.details.field === 'string' ? result.error.details.field : 'form';
    return { errors: { [field]: result.error.message } };
  }

  await setSessionCookie(result.value.token);
  // Outside the try/catch shape above: redirect() signals by throwing, and
  // catching it here would swallow the navigation.
  redirect('/');
}

export async function signInAction(_previous: FormState, form: FormData): Promise<FormState> {
  const parsed = signInSchema.safeParse({
    identifier: text(form, 'identifier'),
    password: text(form, 'password'),
  });

  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const result = await container().identity.signIn(parsed.data);
  if (!result.ok) return { errors: { form: result.error.message } };

  await setSessionCookie(result.value.token);
  redirect('/');
}

export async function signOutAction(): Promise<void> {
  await container().identity.signOut(await rawSessionToken());
  await clearSessionCookie();
  redirect('/');
}

export async function updateProfileAction(
  _previous: FormState,
  form: FormData,
): Promise<FormState> {
  const user = await requireUser();

  const parsed = updateProfileSchema.safeParse({
    displayName: text(form, 'displayName'),
    bio: text(form, 'bio'),
    location: text(form, 'location') || null,
    links: [],
  });

  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  // The actor is resolved here rather than trusted from the form: a hidden
  // field saying which account to edit would be the whole vulnerability.
  const result = await container().identity.updateProfile(
    await currentActor(),
    user.id,
    parsed.data,
  );

  if (!result.ok) return { errors: { form: result.error.message } };
  redirect(`/u/${result.value.handle}`);
}
