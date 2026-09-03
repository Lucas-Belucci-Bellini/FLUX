'use client';

import { useActionState } from 'react';

import { Button, Card } from '@flux/ui';

import type { FormState } from '@/app/actions/auth';

/**
 * The shared shell for the identity forms.
 *
 * A plain `<form action={…}>`: it posts and works with JavaScript disabled,
 * and `useActionState` adds the pending state and the error messages once
 * hydration has happened. Progressive enhancement, not a JavaScript
 * requirement.
 */

export interface FieldSpec {
  readonly name: string;
  readonly label: string;
  readonly type?: 'text' | 'email' | 'password';
  readonly autoComplete?: string;
  readonly hint?: string;
  readonly required?: boolean;
}

export function AuthForm({
  action,
  fields,
  submitLabel,
  footer,
}: {
  action: (state: FormState, form: FormData) => Promise<FormState>;
  fields: readonly FieldSpec[];
  submitLabel: string;
  footer?: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});

  return (
    <Card padding="lg" className="w-full max-w-md">
      <form action={formAction} className="flex flex-col gap-4" noValidate>
        {state.errors?.form ? (
          <p role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
            {state.errors.form}
          </p>
        ) : null}

        {fields.map((field) => {
          const error = state.errors?.[field.name];
          const describedBy = [
            error ? `${field.name}-error` : null,
            field.hint ? `${field.name}-hint` : null,
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <div key={field.name} className="flex flex-col gap-1.5">
              <label htmlFor={field.name} className="text-xs font-medium text-ink">
                {field.label}
              </label>
              <input
                id={field.name}
                name={field.name}
                type={field.type ?? 'text'}
                autoComplete={field.autoComplete}
                required={field.required ?? true}
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy || undefined}
                className={`h-9.5 w-full rounded-md border bg-surface-1 px-3 text-sm text-ink outline-none transition-colors duration-150 ease-flux placeholder:text-ink-faint focus:border-accent ${
                  error ? 'border-danger' : 'border-line'
                }`}
              />
              {field.hint ? (
                <p id={`${field.name}-hint`} className="text-[11px] text-ink-faint">
                  {field.hint}
                </p>
              ) : null}
              {error ? (
                <p id={`${field.name}-error`} className="text-[11px] text-danger">
                  {error}
                </p>
              ) : null}
            </div>
          );
        })}

        <Button type="submit" disabled={pending} className="mt-1 w-full">
          {pending ? 'Working…' : submitLabel}
        </Button>

        {footer ? <div className="pt-1 text-center text-xs text-ink-muted">{footer}</div> : null}
      </form>
    </Card>
  );
}
