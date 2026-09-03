import type { HTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';

import { cn } from '../cn';

/* -------------------------------------------------------------------------- */
/* Card                                                                       */
/* -------------------------------------------------------------------------- */

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Raise the card and light it up on hover. For clickable cards only. */
  interactive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const CARD_PADDING = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
} as const;

export function Card({
  interactive = false,
  padding = 'md',
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-line bg-surface-1 shadow-e1',
        CARD_PADDING[padding],
        interactive &&
          'cursor-pointer transition-[border-color,box-shadow,transform] duration-200 ease-flux hover:border-line-strong hover:shadow-e2',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Badge                                                                      */
/* -------------------------------------------------------------------------- */

export type BadgeTone = 'neutral' | 'accent' | 'live' | 'market' | 'danger';

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: 'bg-surface-2 text-ink-muted border-line',
  accent: 'bg-accent-soft text-accent border-transparent',
  live: 'bg-live-soft text-live border-transparent',
  market: 'bg-market-soft text-market border-transparent',
  danger: 'bg-danger-soft text-danger border-transparent',
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  /** Pulsing dot for anything happening right now. */
  pulse?: boolean;
}

export function Badge({ tone = 'neutral', pulse = false, className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-5 tracking-wide',
        BADGE_TONES[tone],
        className,
      )}
      {...rest}
    >
      {pulse ? (
        <span aria-hidden="true" className="relative flex size-1.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-70" />
          <span className="relative inline-flex size-1.5 rounded-full bg-current" />
        </span>
      ) : null}
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Avatar                                                                     */
/* -------------------------------------------------------------------------- */

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const AVATAR_SIZES: Record<AvatarSize, string> = {
  xs: 'size-6 text-[10px]',
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-14 text-lg',
  xl: 'size-24 text-3xl',
};

export interface AvatarProps {
  /** Used for the alt text and for the initials fallback. */
  name: string;
  src?: string | undefined;
  size?: AvatarSize;
  /** Ring colour for "is live now". */
  live?: boolean;
  className?: string;
}

/** First letters of the first two words, which reads better than one letter. */
export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (words.length === 0) return '?';
  return words.map((word) => [...word][0]?.toUpperCase() ?? '').join('');
}

export function Avatar({ name, src, size = 'md', live = false, className }: AvatarProps) {
  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-3 font-semibold text-ink-muted',
        AVATAR_SIZES[size],
        live && 'outline-2 outline-offset-2 outline-live',
        className,
      )}
    >
      {src ? (
        // Plain img: avatars come from user-controlled object storage, where
        // the framework image optimiser would need an allowlist per host.
        <img src={src} alt={name} className="size-full object-cover" loading="lazy" />
      ) : (
        <span aria-hidden="true">{initialsOf(name)}</span>
      )}
      {!src ? <span className="sr-only">{name}</span> : null}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Input                                                                      */
/* -------------------------------------------------------------------------- */

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leading?: ReactNode;
  invalid?: boolean;
}

export function Input({ leading, invalid = false, className, ...rest }: InputProps) {
  return (
    <span
      className={cn(
        'inline-flex h-9.5 w-full items-center gap-2 rounded-md border bg-surface-1 px-3',
        'transition-colors duration-150 ease-flux focus-within:border-accent',
        invalid ? 'border-danger' : 'border-line',
        className,
      )}
    >
      {leading ? <span className="text-ink-faint">{leading}</span> : null}
      <input
        aria-invalid={invalid || undefined}
        className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
        {...rest}
      />
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Section + empty state                                                      */
/* -------------------------------------------------------------------------- */

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function Section({ title, description, action, className, children, ...rest }: SectionProps) {
  return (
    <section className={cn('flex flex-col gap-3', className)} {...rest}>
      <header className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-base font-semibold tracking-tight text-ink">{title}</h2>
          {description ? <p className="text-xs text-ink-muted">{description}</p> : null}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Shown wherever real content is not there yet. It says why, because an empty
 * rectangle reads as a bug.
 */
export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 rounded-lg border border-dashed border-line bg-surface-1/40 px-6 py-10 text-center',
        className,
      )}
    >
      <p className="text-sm font-medium text-ink">{title}</p>
      {description ? <p className="max-w-prose text-xs text-ink-muted">{description}</p> : null}
      {action}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Skeleton                                                                   */
/* -------------------------------------------------------------------------- */

export function Skeleton({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-md bg-surface-2', className)}
      {...rest}
    />
  );
}
