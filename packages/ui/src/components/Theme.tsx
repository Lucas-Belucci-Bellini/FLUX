'use client';

import { useCallback, useEffect, useState } from 'react';

import { cn } from '../cn';

export type Theme = 'system' | 'light' | 'dark';

export const THEME_STORAGE_KEY = 'flux:theme';

const ORDER: readonly Theme[] = ['system', 'light', 'dark'];

const LABELS: Record<Theme, string> = {
  system: 'System theme',
  light: 'Light theme',
  dark: 'Dark theme',
};

const GLYPHS: Record<Theme, string> = {
  system: 'A',
  light: 'L',
  dark: 'D',
};

/**
 * Runs before first paint, from a blocking inline script.
 *
 * Reading the stored theme in an effect would paint the wrong colours first
 * and then correct them, which is the flash every themed site is judged on.
 */
export const themeBootScript = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(t==="light"||t==="dark"){document.documentElement.dataset.theme=t;}}catch(e){}})();`;

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  } catch {
    // Private mode, or site data blocked. "system" is a correct answer.
  }
  return 'system';
}

function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === 'system') delete root.dataset.theme;
  else root.dataset.theme = theme;

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Not being able to remember the choice must not break making it.
  }
}

export function ThemeToggle({ className }: { className?: string }) {
  // Always starts at the server-rendered value; the effect corrects it once
  // the client knows what is stored, so markup matches on hydration.
  const [theme, setTheme] = useState<Theme>('system');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setTheme(readStoredTheme());
    setReady(true);
  }, []);

  const cycle = useCallback(() => {
    setTheme((current) => {
      const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length] ?? 'system';
      applyTheme(next);
      return next;
    });
  }, []);

  return (
    <button
      type="button"
      onClick={cycle}
      title={LABELS[theme]}
      aria-label={LABELS[theme]}
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-md border border-line bg-surface-1',
        'text-xs font-semibold text-ink-muted transition-colors duration-150 ease-flux',
        'hover:bg-surface-2 hover:text-ink',
        className,
      )}
    >
      <span aria-hidden="true">{ready ? GLYPHS[theme] : GLYPHS.system}</span>
    </button>
  );
}
