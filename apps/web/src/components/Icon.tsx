import type { SVGProps } from 'react';

/**
 * The icon set, drawn inline.
 *
 * An icon package would be another dependency, another bundle and another
 * visual voice. Twenty paths on one 24px grid with one stroke weight is the
 * whole need, and it stays consistent by construction.
 */

const PATHS = {
  home: ['M3 10.6 12 3.2l9 7.4', 'M5.4 9.6V20.8h4.6v-6h4v6h4.6V9.6'],
  compass: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'm15 9-1.9 4.1L9 15l1.9-4.1L15 9Z'],
  shorts: [
    'M8.2 3.2h7.6a3 3 0 0 1 3 3v11.6a3 3 0 0 1-3 3H8.2a3 3 0 0 1-3-3V6.2a3 3 0 0 1 3-3Z',
    'm10.6 9 4 3-4 3V9Z',
  ],
  users: [
    'M10 11.2a3.4 3.4 0 1 0 0-6.8 3.4 3.4 0 0 0 0 6.8Z',
    'M3.6 19.6v-1.4a4 4 0 0 1 4-4h4.8a4 4 0 0 1 4 4v1.4',
    'M16.2 4.8a3.4 3.4 0 0 1 0 6.4',
    'M18 14.4a4 4 0 0 1 2.4 3.8v1.4',
  ],
  user: [
    'M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z',
    'M5 20a7 7 0 0 1 14 0',
  ],
  login: [
    'M10 4.5H6.8A2.8 2.8 0 0 0 4 7.3v9.4a2.8 2.8 0 0 0 2.8 2.8H10',
    'M12.5 8.2 16.3 12l-3.8 3.8',
    'M8.5 12h7.8',
  ],
  music: [
    'M9 17.4V6.2l10-2v11.2',
    'M6.5 20a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
    'M16.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  ],
  live: [
    'M12 13.6a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2Z',
    'M8.6 8.6a4.8 4.8 0 0 0 0 6.8',
    'M15.4 8.6a4.8 4.8 0 0 1 0 6.8',
    'M6 5.8a8.8 8.8 0 0 0 0 12.4',
    'M18 5.8a8.8 8.8 0 0 1 0 12.4',
  ],
  bag: ['M5.6 7.8h12.8l1 12.4H4.6l1-12.4Z', 'M9 7.8V6a3 3 0 0 1 6 0v1.8'],
  library: ['M4 5.4h3.6v14.2H4z', 'M9.6 5.4h3.6v14.2H9.6z', 'm16 6.2 3.6 1-2.6 12.2-3.6-1z'],
  clock: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M12 7.2v5.2l3.4 2'],
  bookmark: ['M6.8 3.8h10.4v16.8l-5.2-3.6-5.2 3.6V3.8Z'],
  heart: [
    'M12 20.2C8.6 17.6 4.4 14 4.4 10.2a3.9 3.9 0 0 1 7.6-1.4 3.9 3.9 0 0 1 7.6 1.4c0 3.8-4.2 7.4-7.6 10Z',
  ],
  activity: ['M3 12.2h3.8l2.6 7 4.2-14.4 2.6 7.4H21'],
  search: ['M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z', 'm16.3 16.3 4 4'],
  plus: ['M12 5.4v13.2', 'M5.4 12h13.2'],
  graph: [
    'M6 8a2.6 2.6 0 1 0 0-5.2A2.6 2.6 0 0 0 6 8Z',
    'M18 21.2a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z',
    'M6 21.2a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z',
    'M6 8v8',
    'M8.4 6.6h6.2a3 3 0 0 1 3 3v6.2',
  ],
  spark: ['M12 3.4 13.9 9l5.6 1.9-5.6 1.9L12 18.4l-1.9-5.6L4.5 10.9 10.1 9 12 3.4Z'],
} as const;

export type IconName = keyof typeof PATHS;

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 20, className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      // Icons here are always paired with text or an aria-label on the control.
      aria-hidden="true"
      focusable="false"
      className={className}
      {...rest}
    >
      {PATHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
