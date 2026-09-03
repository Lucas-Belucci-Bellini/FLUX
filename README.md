# FLUX

**Video, communities, music, live and a marketplace on a single content graph.**

FLUX is not a video site with a forum bolted on. It is one platform where a
piece of content is never a dead end: a video belongs to a community, features a
track, carries a product shelf, has a discussion attached and may itself be the
recording of a live. You never have to leave to find the rest of it.

That premise is not a slogan here - it is the data model. See
[`docs/architecture/content-graph.md`](docs/architecture/content-graph.md).

---

## Status

**Phases 0 (foundation) and 1 (authentication and profiles) are complete.
Phase 2 (video and creators) is next.**

The project is built in strict order, and a phase is never started while the one
before it is broken. The full order is in [`ROADMAP.md`](ROADMAP.md); the app
itself shows live status at `/` and `/diagnostics`.

Anything not yet built is visible in the product as a disabled navigation item
labelled with the phase that brings it. There are no links to nowhere.

---

## Quick start

Requires **Node 22.12 or newer**.

```bash
git clone https://github.com/Lucas-Belucci-Bellini/FLUX.git
cd FLUX
npm install
npm run dev
```

Then open <http://localhost:3000>.

No database, no Docker, no services. With `DATABASE_URL` unset, every
repository uses an in-memory adapter, so a clean checkout runs immediately.
`/diagnostics` tells you which adapter is live.

### Scripts

| Command              | What it does                                              |
| -------------------- | --------------------------------------------------------- |
| `npm run dev`        | Dev server with hot reload                                 |
| `npm run build`      | Type-check every workspace, then build the web app         |
| `npm start`          | Serve the production build                                 |
| `npm test`           | Run the whole test suite once                              |
| `npm run test:watch` | Tests in watch mode                                        |
| `npm run lint`       | ESLint across the monorepo                                 |
| `npm run typecheck`  | `tsc` per workspace                                        |
| `npm run verify`     | lint + typecheck + test - what CI runs, run it before a PR |

To configure the environment, copy `.env.example` to `.env.local`. Every
variable is documented there and validated at boot by `apps/web/src/lib/env.ts`.

---

## Layout

```
FLUX
├── apps/
│   └── web/            Next.js app: routes, pages, server actions
├── packages/
│   ├── core/           the kernel: content graph, ids, errors, events, paging
│   ├── identity/       accounts, sessions, authorisation (server-side only)
│   └── ui/             the design system: tokens and primitives
├── docs/               architecture, decisions, data model, API
├── ARCHITECTURE.md     how the pieces fit and why
├── ROADMAP.md          the build order, phase by phase
└── CONTRIBUTING.md     how to work on it
```

`services/` (media, transcoding, realtime, workers) joins the workspace when a
phase actually needs a process of its own - see
[ADR-0003](docs/architecture/decisions/ADR-0003-start-as-a-modular-monolith.md).

### The two rules that shape everything

1. **`packages/core` has zero dependencies, no framework and no DOM.** It runs
   unchanged in a browser, a Node service, a worker or a test. ESLint enforces
   the import ban. This is what stops two copies of the same rule from drifting.
2. **Nothing writes a raw colour, spacing or radius.** Every surface reads
   tokens from `packages/ui/src/styles/tokens.css`, which is what makes light,
   dark and system themes a one-file concern.

---

## Stack

| Layer      | Choice                    | Why                                                              |
| ---------- | ------------------------- | ---------------------------------------------------------------- |
| Monorepo   | npm workspaces            | Already in npm. No extra build orchestrator to learn or maintain. |
| Language   | TypeScript, strict        | The contracts between eleven feature areas are the product.       |
| Web        | Next.js (App Router)      | Server rendering, streaming and routing without hand-rolling them.|
| Styling    | Tailwind CSS v4           | Token-driven utilities, no runtime CSS-in-JS cost.                |
| Validation | Zod                       | One schema validating on both sides of the wire.                  |
| Tests      | Vitest                    | Runs TypeScript and ESM natively; no separate transform step.     |
| Data       | PostgreSQL (from phase 1) | Relational by nature: the content graph is a join-heavy edge set. |

Deliberately **not** here yet: Redis, a message broker, a search engine, an
object store, a transcoder. Each arrives in the phase that needs it, with the
reason recorded. See [ADR-0004](docs/architecture/decisions/ADR-0004-defer-infrastructure.md).

---

## Documentation

- [`ARCHITECTURE.md`](ARCHITECTURE.md) - the shape of the system
- [`ROADMAP.md`](ROADMAP.md) - what gets built, in what order
- [`CONTRIBUTING.md`](CONTRIBUTING.md) - workflow, conventions, definition of done
- [`docs/architecture/content-graph.md`](docs/architecture/content-graph.md) - the central idea, in detail
- [`docs/architecture/decisions/`](docs/architecture/decisions/) - the decisions, with their reasons

---

## Licence

[AGPL-3.0-only](LICENSE). FLUX is a hosted social platform, so network copyleft
is the licence that matches how it is actually used - running a modified copy as
a service carries the same obligation as distributing one.
