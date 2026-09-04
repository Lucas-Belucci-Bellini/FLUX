import Link from 'next/link';

import { Badge, Button, Card, Input } from '@flux/ui';

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center py-12">
      <Card padding="lg" className="w-full">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <Badge tone="accent" className="self-start">Account foundation</Badge>
            <h1 className="text-2xl font-semibold tracking-[-0.02em] text-ink">Welcome to FLUX</h1>
            <p className="text-sm leading-relaxed text-ink-muted">
              Authentication is the first identity boundary. Real sessions and providers plug into this route without changing the page contract.
            </p>
          </div>

          <form className="flex flex-col gap-4" action="#" method="post">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-xs font-medium text-ink">Email</label>
              <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-xs font-medium text-ink">Password</label>
              <Input id="password" name="password" type="password" autoComplete="current-password" placeholder="••••••••" required />
            </div>
            <Button type="submit" className="w-full">Sign in</Button>
          </form>

          <p className="text-xs leading-relaxed text-ink-faint">
            This is a UI boundary only. The form intentionally does not fake authentication or create a fake session.
          </p>

          <Link href="/" className="text-sm text-accent hover:underline">Back to Home</Link>
        </div>
      </Card>
    </div>
  );
}
