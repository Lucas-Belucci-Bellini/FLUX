/**
 * Join class names, dropping anything falsy.
 *
 * Deliberately not a dependency: this is the whole feature, and `@flux/ui`
 * having zero runtime dependencies is worth more than the twenty lines saved.
 */
export type ClassValue = string | number | false | null | undefined | ClassValue[];

export function cn(...values: ClassValue[]): string {
  const out: string[] = [];
  for (const value of values) {
    if (!value && value !== 0) continue;
    if (Array.isArray(value)) {
      const nested = cn(...value);
      if (nested) out.push(nested);
    } else {
      out.push(String(value));
    }
  }
  return out.join(' ');
}
