# Contributing to FLUX

## Getting set up

Node 22.12 or newer.

```bash
npm install
npm run dev          # http://localhost:3000
npm run verify       # lint + typecheck + test — run this before every PR
```

No database is required. With `DATABASE_URL` unset the app uses in-memory
adapters; `/diagnostics` shows which one is live.

---

## Branches and commits

```
main          always green, always deployable
develop       integration branch
feature/*     one feature or one phase step
fix/*         one defect
```

Never push a large or destructive change straight to `main`.

Commits use Conventional Commits, scoped by area:

```
feat(core):      add content graph relation contract
feat(auth):      add session rotation on privilege change
fix(ui):         let the header search field shrink on narrow screens
docs(architecture): record why infrastructure is deferred
test(graph):     cover cursor paging over neighbours
```

Write commit messages that say **why**, not only what. The diff already says
what.

---

## Definition of done

A change is done when all of these hold:

- [ ] `npm run verify` passes
- [ ] `npm run build` passes
- [ ] new behaviour has tests, and they would fail without the change
- [ ] UI changes were checked in a browser: light and dark, desktop and mobile,
      keyboard reachable, no horizontal overflow
- [ ] authorisation is enforced on the server, not only in the UI
- [ ] documentation is updated when the change alters a contract
- [ ] an ADR exists if a decision was made that a future reader would otherwise
      have to re-derive

"It compiles" is not done. "The tests I wrote pass" is not done either if the
feature was never run.

---

## Rules that are not negotiable

### `packages/core` has no dependencies

No framework, no DOM, no npm package. It must run unchanged in a browser, in
Node, in a worker and in a test. ESLint enforces this; if the rule is in your
way, the code you are writing belongs in a domain package or in `apps/web`.

### Everything visual comes from tokens

No raw hex, no raw pixel value, no ad-hoc duration in a component. Extend
`packages/ui/src/styles/tokens.css` instead. This is what makes the theme
switch a one-file concern rather than a hunt.

### No unbounded lists

Every list-returning function takes a `PageRequest` and returns a `Page`. If you
are writing `.map()` over "all of them", stop.

### No permanent mocks

Mock data is fine while a feature is being built. It is not fine as the finished
state. Every feature ends behind a port with a real adapter - even if that
adapter keeps its rows in memory for now. If you cannot describe the path to the
real implementation, the feature is not ready.

### Time is an input

Use the injected `Clock`. `new Date()` with no arguments is a lint error, because
code that reads the wall clock directly cannot be tested without sleeping.

### Never trust the client

Validate on the server with the same Zod schema the client uses, authorise on
the server, and parse ids from URLs and forms through `parseId()` before they
reach domain code.

---

## Adding to the content graph

New node kind or new relation? Both are decisions, not implementation details:

1. add the kind to `packages/core/src/graph/kinds.ts`
2. add every legal relation to `packages/core/src/graph/relations.ts`, with its
   cardinality and both reading directions
3. add a test in `graph.test.ts` asserting what is now allowed **and what is
   still refused**
4. check `/diagnostics` - the new relation should appear without any UI change

If a relation is not in that table, it cannot be written. That is the point.

---

## Adding an event

1. add it to `FluxEventMap` in `packages/core/src/events.ts` with its payload
2. add the name to `FLUX_EVENT_NAMES` - the build fails if you forget, and the
   error names the missing event
3. emit it from the area that owns the fact; subscribe from areas that care

Do not call another area directly to make something happen. Announce it.

---

## Tests

Vitest, three projects: `core` (node), `ui` and `web` (jsdom).

```bash
npm test                      # everything, once
npm run test:watch            # watch mode
npx vitest run --project core # one project
```

Write tests that would fail if the behaviour regressed. A test asserting that a
function returns what it just returned protects nothing. Prefer testing a
contract (paging never drops or repeats an item) over testing an implementation.

---

## Pull requests

Open as a draft, describe what changed and why, and let CI go green before
asking for review. Keep one PR to one concern - a formatting sweep mixed into a
behaviour change hides the behaviour change.
