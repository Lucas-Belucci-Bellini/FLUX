# Architecture

How FLUX is put together, and why it is put together that way. Decisions with
lasting consequences get their own record in
[`docs/architecture/decisions/`](docs/architecture/decisions/); this document is
the map that ties them together.

---

## 1. The problem this shape solves

FLUX carries eleven feature areas - video, shorts, live, communities, posts,
comments, messages, music, marketplace, search, recommendation. Built naively,
each one grows a private idea of what a "creator" or a "like" is, and by the
third area every change touches all of them.

Three structural decisions prevent that:

1. **One graph, one contract.** Content is related through a single typed edge
   set with a declared table of legal relations. Nothing invents its own linking
   scheme.
2. **A kernel that cannot depend on anything.** The rules every area shares live
   in `packages/core`, which is forbidden from importing a framework, the DOM or
   any package at all.
3. **Announcements, not calls.** Areas emit events; they do not reach into each
   other. Publishing a video does not know that notifications, search and
   recommendation exist.

---

## 2. Layers

```
        ┌──────────────────────────────────────────────┐
        │  apps/web           routes, pages, actions   │  ← framework lives here
        ├──────────────────────────────────────────────┤
        │  packages/ui        tokens, primitives       │  ← React, no domain logic
        ├──────────────────────────────────────────────┤
        │  packages/<domain>  entities, rules, ports   │  ← from phase 1 onward
        ├──────────────────────────────────────────────┤
        │  packages/core      graph, ids, errors,      │  ← zero dependencies
        │                     events, paging, clock    │
        └──────────────────────────────────────────────┘
                      ▲                        ▲
                      │ implements ports       │
        ┌─────────────┴──────────┐  ┌──────────┴─────────────┐
        │  in-memory adapters    │  │  PostgreSQL adapters    │
        │  (default, no service) │  │  (when DATABASE_URL set)│
        └────────────────────────┘  └─────────────────────────┘
```

Dependencies point in one direction only: downward. `core` knows nothing about
`ui`, `ui` knows nothing about domains, and no layer knows about its adapters.

### The kernel (`packages/core`)

Contains exactly the things every area needs and none of the things any single
area needs:

| Module          | Responsibility                                                     |
| --------------- | ------------------------------------------------------------------ |
| `graph/`        | node kinds, edge kinds, the relation contract, the graph port       |
| `id.ts`         | sortable ULID-style identifiers, branded by the kind they point at  |
| `result.ts`     | `Result<T, E>` - expected failure is a return value, not a throw    |
| `errors.ts`     | the failure vocabulary and its single mapping to HTTP status        |
| `events.ts`     | the event catalogue and the wildcard-capable bus                    |
| `pagination.ts` | cursor paging; no endpoint may return an unbounded list             |
| `clock.ts`      | time as an injected input, so tests never sleep                     |

The dependency ban is not a convention, it is a lint rule
(`no-restricted-imports` over `packages/core/**`).

---

## 3. The content graph

The central idea, covered in full in
[`docs/architecture/content-graph.md`](docs/architecture/content-graph.md).

In short: content is nodes (`{ kind, id }`) joined by typed, directed edges. A
closed table in `packages/core/src/graph/relations.ts` declares every legal
`(from-kind, edge, to-kind)` triple, along with whether it is single-valued and
how it reads in both directions. `connect()` refuses anything absent from that
table.

That table is the one place FLUX declares what may relate to what. An impossible
edge fails at write time rather than surfacing months later as a broken card in
a feed.

Because relations are data, generic behaviour follows for free: the relations
panel, the "link this to…" picker and `/diagnostics` all read the same table
instead of hardcoding a list.

---

## 4. Ports and adapters

Domain code depends on interfaces, never on a driver:

```ts
interface ContentGraph {
  connect(input: ConnectInput): Promise<Result<GraphEdge, FluxError>>;
  neighbors(ref: NodeRef, query?: NeighborQuery): Promise<Page<GraphEdge>>;
  context(ref: NodeRef): Promise<GraphContext>;
  // …
}
```

Two adapters implement each port:

- **in-memory** - the default. `npm run dev` works on a clean machine with
  nothing installed and no containers running. Also what the tests use, which is
  why the suite is fast and deterministic.
- **PostgreSQL** - selected when `DATABASE_URL` is set.

The same test suite is written against the port, so both adapters are held to
one definition of correct behaviour rather than drifting apart.

This is also the honest answer to "no permanent mocks": a feature is never left
running on invented data. It runs on a real adapter that happens to keep its
rows in memory, behind the interface the production adapter implements.

---

## 5. Events

Areas announce facts. `packages/core/src/events.ts` holds the catalogue as a
typed map, so payloads are checked at both ends, and the runtime list is exported
for the diagnostics page. A compile-time guard fails the build if an event is
added to the map without being listed.

Subscriptions accept wildcards - `video:*` for one area, `*` for audit logging
and the developer inspector. A listener that throws is contained and reported;
it cannot take down the request that emitted the event.

The bus is in-process today. When a phase needs cross-process delivery, the
same interface gains a durable transport - the emitters do not change.

---

## 6. Security posture

Recorded properly in
[ADR-0005](docs/architecture/decisions/ADR-0005-authorisation-is-server-side.md).
The short version:

- **Authorisation is decided on the server, per request, always.** Hiding a
  button is a courtesy to the user, never a control.
- **Deny by default.** A capability that has not been granted is denied; a new
  permission with no mapping is denied rather than open.
- **Untrusted input is parsed at the boundary.** One Zod schema validates a
  payload on both sides of the wire, and ids from URLs and forms pass through
  `parseId()` before they reach domain code.
- **Secrets are read in one place.** `apps/web/src/lib/env.ts` validates the
  environment at boot and refuses to serve production without a session secret.

---

## 7. Performance posture

- **Every list is a cursor page.** Offset paging makes the database scan what it
  skips and duplicates rows when the list shifts under the reader. `MAX_PAGE_SIZE`
  clamps hostile input rather than rejecting it.
- **Ids sort by creation time**, so feeds page on the primary key without a
  secondary sort column.
- **Server components by default**; `'use client'` is opt-in and rare.
- Caching, CDN and asset optimisation are phase 12 work, applied against
  measurements rather than in advance.

---

## 8. Testing

| Kind        | Where                            | What it protects                       |
| ----------- | -------------------------------- | -------------------------------------- |
| Unit        | `packages/*/src/**/*.test.ts`    | domain rules, the graph contract       |
| Component   | `packages/ui`, `apps/web`        | accessible names, states, no-JS paths  |
| Integration | per-domain, against the port     | both adapters, one specification       |
| API         | route handlers (from phase 1)    | authorisation, validation, status codes|

Tests use the injectable clock instead of sleeping, and the in-memory adapters
instead of a database, so the suite runs in seconds.

---

## 9. Where this goes next

FLUX starts as a modular monolith
([ADR-0003](docs/architecture/decisions/ADR-0003-start-as-a-modular-monolith.md)):
one deployable, hard internal seams. The seams are where processes get split
later, and each split has a trigger written down rather than a guess:

| Future service | Split when                                                    |
| -------------- | ------------------------------------------------------------- |
| `media`        | uploads need direct-to-storage and signed URLs (phase 2)       |
| `transcoding`  | encoding must not share a request process (phase 2)            |
| `realtime`     | presence and chat need long-lived connections (phase 7)        |
| `worker`       | fan-out, indexing and notifications outgrow request time (7)   |
| `search`       | queries outgrow what PostgreSQL indexes answer well (phase 3+) |

Splitting earlier would buy distribution problems before there is anything to
distribute.
