# Overview

The short tour. [`../../ARCHITECTURE.md`](../../ARCHITECTURE.md) has the detail.

## In one paragraph

FLUX is a modular monolith in TypeScript. A dependency-free kernel
(`packages/core`) holds the content graph, identifiers, the error vocabulary,
the event bus and cursor paging. Domain packages sit on top of it and depend on
ports, never on drivers - so the whole product runs on in-memory adapters with
no database installed, and switches to PostgreSQL by setting one environment
variable. A Next.js app renders it, using a token-driven design system that
carries light, dark and system themes. Areas announce facts on an event bus
rather than calling each other.

## The three things to know

**1. The graph is the product.** Content is nodes joined by typed edges, and a
closed table declares every legal relation. Nothing else in the codebase invents
a way to link two things. See
[`content-graph.md`](content-graph.md).

**2. The kernel cannot depend on anything.** No React, no Next, no npm package,
no DOM. It runs identically in a browser, in Node, in a worker and in a test.
ESLint enforces it. This is what stops the same rule existing twice.

**3. Everything is behind a port.** Repositories, the graph, the event bus.
Two adapters implement each, tested against one shared specification. That is
how "no permanent mocks" is achieved without requiring a database on day one.

## Reading order for a newcomer

1. `packages/core/src/graph/relations.ts` - what the platform can express
2. `packages/core/src/graph/graph.ts` - how it is written and queried
3. `packages/core/src/events.ts` - what the platform announces
4. `apps/web/src/app/diagnostics/page.tsx` - all of the above, on screen
5. `packages/ui/src/styles/tokens.css` - what everything looks like, and why

## Conventions worth knowing early

| Convention | Where it bites |
| ---------- | -------------- |
| Time is injected | `new Date()` with no arguments is a lint error |
| Lists are paged | every list function takes `PageRequest`, returns `Page` |
| Failure is a value | domain functions return `Result`, they do not throw |
| Ids are branded | `Id<'video'>` will not pass as `Id<'community'>` |
| Colours are tokens | no raw hex anywhere outside `tokens.css` |
