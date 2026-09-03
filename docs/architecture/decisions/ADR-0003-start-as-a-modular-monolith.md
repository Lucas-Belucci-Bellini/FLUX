# ADR-0003: start as a modular monolith

- **Status:** accepted
- **Date:** 2026-09-03
- **Phase:** 0

## Context

The target architecture has services: media, transcoding, realtime, search,
workers. The temptation is to create those boundaries as processes immediately,
because the diagram already shows them.

## Decision

**One deployable, hard internal seams.** Boundaries are enforced by module
structure, ports and the event bus - not by network calls.

Each future service has a written trigger for when it splits out
(see ARCHITECTURE.md, section 9), rather than a guess at a date.

## Consequences

Good:

- A change that crosses two areas is one commit, one test run, one deploy.
- Refactoring a boundary that turns out to be wrong is a file move, not a
  migration and a versioned wire contract.
- No distributed-systems failure modes before there is a system to distribute:
  no partial failures, no retry storms, no cross-service tracing to debug.
- `npm run dev` starts the whole product.

Bad, and accepted:

- Everything scales together until a split happens. Acceptable while nothing has
  a load profile of its own.
- Discipline is required: it is easy to reach across a seam when nothing
  physically stops you. Mitigated by the kernel's lint-enforced dependency ban,
  by ports, and by events instead of direct calls.

## The seams that matter

The split points are chosen so that when a service does move out, the code above
it does not change:

- domain code depends on **ports**, so an adapter can become an HTTP client
- areas communicate through **events**, so a listener can move to another process
  behind the same interface
- the graph is a **single port**, so it can move behind a service or a cache
