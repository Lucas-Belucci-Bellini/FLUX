import Link from 'next/link';

import { EmptyState } from '@flux/ui';

export default function NotFound() {
  return (
    <div className="py-16">
      <EmptyState
        title="Nothing here yet"
        description="This route either does not exist or belongs to a phase that has not been built. The sidebar marks unbuilt destinations with the phase that brings them."
        action={
          <Link
            href="/"
            className="mt-2 inline-flex h-9.5 items-center rounded-md bg-accent px-4 text-sm font-medium text-on-accent transition-colors duration-150 ease-flux hover:bg-accent-hover"
          >
            Back to Home
          </Link>
        }
      />
    </div>
  );
}
