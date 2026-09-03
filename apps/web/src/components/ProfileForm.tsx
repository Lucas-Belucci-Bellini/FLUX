'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import { Button, Card } from '@flux/ui';

import type { FormState } from '@/app/actions/auth';

export interface ProfileFormValues {
  readonly displayName: string;
  readonly bio: string;
  readonly location: string;
}

const FIELD_CLASSES =
  'w-full rounded-md border border-line bg-surface-1 px-3 py-2 text-sm text-ink outline-none transition-colors duration-150 ease-flux placeholder:text-ink-faint focus:border-accent';

export function ProfileForm({
  action,
  handle,
  initial,
}: {
  action: (state: FormState, form: FormData) => Promise<FormState>;
  handle: string;
  initial: ProfileFormValues;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});

  return (
    <Card padding="lg">
      <form action={formAction} className="flex flex-col gap-5" noValidate>
        {state.errors?.form ? (
          <p role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
            {state.errors.form}
          </p>
        ) : null}

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-ink">Handle</span>
          <p className="font-mono text-sm text-ink-muted">@{handle}</p>
          <p className="text-[11px] text-ink-faint">
            Handles are permanent: links, mentions and community history all point at them.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="displayName" className="text-xs font-medium text-ink">
            Display name
          </label>
          <input
            id="displayName"
            name="displayName"
            defaultValue={initial.displayName}
            maxLength={50}
            required
            aria-invalid={state.errors?.displayName ? true : undefined}
            className={FIELD_CLASSES}
          />
          {state.errors?.displayName ? (
            <p className="text-[11px] text-danger">{state.errors.displayName}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="bio" className="text-xs font-medium text-ink">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            defaultValue={initial.bio}
            rows={4}
            maxLength={500}
            className={`${FIELD_CLASSES} resize-y`}
          />
          {state.errors?.bio ? (
            <p className="text-[11px] text-danger">{state.errors.bio}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="location" className="text-xs font-medium text-ink">
            Location <span className="text-ink-faint">(optional)</span>
          </label>
          <input
            id="location"
            name="location"
            defaultValue={initial.location}
            maxLength={60}
            className={FIELD_CLASSES}
          />
        </div>

        <div className="flex items-center gap-3 pt-1">
          <Button type="submit" disabled={pending}>
            {pending ? 'Saving…' : 'Save profile'}
          </Button>
          <Link href={`/u/${handle}`} className="text-xs text-ink-muted hover:text-ink">
            Cancel
          </Link>
        </div>
      </form>
    </Card>
  );
}
