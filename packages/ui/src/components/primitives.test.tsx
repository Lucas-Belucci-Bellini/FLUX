import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { cn } from '../cn';
import { Button } from './Button';
import { Avatar, Badge, EmptyState, initialsOf } from './primitives';

describe('cn', () => {
  it('drops falsy values and flattens arrays', () => {
    expect(cn('a', false, undefined, null, ['b', 'c'], 'd')).toBe('a b c d');
    expect(cn()).toBe('');
  });
});

describe('Button', () => {
  it('defaults to type="button" so it cannot submit a form by accident', () => {
    render(<Button>Publish</Button>);
    expect(screen.getByRole('button', { name: 'Publish' })).toHaveProperty('type', 'button');
  });

  it('still allows an explicit submit', () => {
    render(<Button type="submit">Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' })).toHaveProperty('type', 'submit');
  });

  it('carries the variant through to classes', () => {
    render(<Button variant="live">Go live</Button>);
    expect(screen.getByRole('button', { name: 'Go live' }).className).toContain('bg-live');
  });
});

describe('initialsOf', () => {
  it('takes the first letter of the first two words', () => {
    expect(initialsOf('War Thunder Brasil')).toBe('WT');
    expect(initialsOf('flux')).toBe('F');
    expect(initialsOf('   ')).toBe('?');
  });

  it('handles names outside the Latin alphabet', () => {
    expect(initialsOf('日本 音楽')).toBe('日音');
  });
});

describe('Avatar', () => {
  it('keeps the name reachable when it falls back to initials', () => {
    render(<Avatar name="Ana Souza" />);
    expect(screen.getByText('Ana Souza')).toBeDefined();
  });

  it('uses the name as alt text when an image is present', () => {
    render(<Avatar name="Ana Souza" src="https://example.test/a.png" />);
    expect(screen.getByAltText('Ana Souza')).toBeDefined();
  });
});

describe('Badge', () => {
  it('marks the live dot as decoration', () => {
    const { container } = render(
      <Badge tone="live" pulse>
        LIVE
      </Badge>,
    );
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(1);
  });
});

describe('EmptyState', () => {
  it('explains itself rather than showing a blank box', () => {
    render(<EmptyState title="Nothing here yet" description="Videos arrive in phase 2." />);
    expect(screen.getByText('Nothing here yet')).toBeDefined();
    expect(screen.getByText('Videos arrive in phase 2.')).toBeDefined();
  });
});
