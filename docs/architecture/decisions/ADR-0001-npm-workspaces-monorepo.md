# ADR-0001: npm workspaces for the monorepo

- **Status:** accepted
- **Date:** 2026-09-03
- **Phase:** 0

## Context

FLUX is one product made of many parts: a web app, a design system, a kernel,
and eventually several services. They share types and evolve together, so they
belong in one repository. The question is what manages that repository.

The obvious candidates were pnpm workspaces plus Turborepo or Nx, and plain npm
workspaces.

## Decision

Plain **npm workspaces**, with no build orchestrator.

Workspace packages publish TypeScript source (`exports` points at `src/index.ts`)
rather than a build output, and Next transpiles them via `transpilePackages`.

## Consequences

Good:

- `npm install && npm run dev` works on a clean machine with nothing installed
  globally. That was a hard requirement.
- No build step between packages. Editing the design system shows up in the dev
  server immediately instead of after a rebuild.
- One fewer tool with its own cache, config and failure modes.

Bad, and accepted:

- No remote caching or task graph. At this size, `npm run verify` takes seconds;
  when it stops doing so, adding Turborepo is a contained change because the
  scripts it would wrap already exist.
- Consumers must transpile the packages. Fine for the app and for Vitest, both
  of which handle TypeScript natively. A future plain-Node service will need
  `tsx` or a build step - noted, not paid for yet.

## Alternatives

- **pnpm + Turborepo** - better at scale, but adds a package manager and an
  orchestrator before there is a scale problem to solve.
- **Separate repositories** - the shared contracts are the product; splitting
  them would mean versioning and publishing the kernel before there is a second
  consumer.
