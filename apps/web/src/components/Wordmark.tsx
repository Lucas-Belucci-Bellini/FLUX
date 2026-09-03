/**
 * The FLUX mark: three currents, offset, moving the same way.
 *
 * It reads as motion at 20px and as a stack of streams at 200px, which is the
 * whole idea of the product - separate feeds, one flow.
 */
export function FluxMark({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path
        d="M3.2 7.4c3.6-3.2 7.2 3.2 10.8 0s5.4-.6 6.8.8"
        stroke="var(--flux-accent)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M3.2 12.4c3.6-3.2 7.2 3.2 10.8 0s5.4-.6 6.8.8"
        stroke="var(--flux-live)"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M3.2 17.4c3.6-3.2 7.2 3.2 10.8 0s5.4-.6 6.8.8"
        stroke="var(--flux-market)"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ''}`}>
      <FluxMark />
      <span className="text-[17px] font-semibold tracking-[-0.02em] text-ink">FLUX</span>
    </span>
  );
}
