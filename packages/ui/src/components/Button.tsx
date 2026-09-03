import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '../cn';

/**
 * Variants carry the palette's meaning rather than a colour name: `live` is
 * for going live, `market` for buying. Renaming the colour later must not mean
 * renaming every call site.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'live' | 'market' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const BASE =
  'inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap ' +
  'rounded-md border border-transparent select-none ' +
  'transition-[background-color,border-color,color,opacity] duration-150 ease-flux ' +
  'disabled:pointer-events-none disabled:opacity-50';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-on-accent hover:bg-accent-hover',
  secondary: 'bg-surface-2 text-ink border-line hover:bg-surface-3',
  ghost: 'bg-transparent text-ink-muted hover:bg-surface-2 hover:text-ink',
  live: 'bg-live text-on-live hover:opacity-90',
  market: 'bg-market text-on-market hover:opacity-90',
  danger: 'bg-danger text-on-danger hover:opacity-90',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-9.5 px-4 text-sm',
  lg: 'h-11 px-5 text-base',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Square, icon-only. Needs an `aria-label` to stay usable. */
  iconOnly?: boolean;
  leading?: ReactNode;
  trailing?: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  iconOnly = false,
  leading,
  trailing,
  className,
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      // Buttons inside forms default to submit, which fires navigations nobody
      // asked for. Opting in is safer than remembering to opt out.
      type={type}
      className={cn(
        BASE,
        VARIANTS[variant],
        SIZES[size],
        iconOnly && 'aspect-square px-0',
        className,
      )}
      {...rest}
    >
      {leading}
      {children}
      {trailing}
    </button>
  );
}
