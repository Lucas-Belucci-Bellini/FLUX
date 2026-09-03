# ADR-0002: content is a typed edge set with a closed relation contract

- **Status:** accepted
- **Date:** 2026-09-03
- **Phase:** 0

## Context

FLUX's premise is that content connects: a video belongs to a community,
features a track, carries products, has a discussion, may be cut from a live.
Eleven feature areas will each want to link to the others.

Left to themselves, each area would grow its own linking scheme - a
`communityId` column here, a join table there, a JSON array of product ids
somewhere else. Six months in, "what is attached to this video?" becomes eleven
different queries and no single answer.

## Decision

One typed, directed edge set for all content relations, and a **closed table of
legal relations** (`packages/core/src/graph/relations.ts`) that `connect()`
consults on every write.

Each rule declares the permitted `(from-kind, edge, to-kind)` triple, its
cardinality, and how it reads in both directions.

## Consequences

Good:

- An impossible edge cannot be written. It fails at the call site with a message
  naming the triple, not in production as a broken card.
- One place to read to know what the platform can express - and one place to
  change to extend it.
- Generic UI: the relations panel, the link picker and `/diagnostics` all read
  the table. New relations appear without UI work.
- The product promise is testable. "Everything connects" is a set of assertions
  in `graph.test.ts`, including the connections that must stay impossible.
- One PostgreSQL table with two indexes serves every relation query.

Bad, and accepted:

- Adding a relation is a deliberate act - a row, a test, a review. That friction
  is the feature; it is what stops the graph turning into an untyped soup.
- Entity-specific fields do not live on edges. A "video in community" edge
  cannot carry a per-community pin flag; that belongs on a domain row keyed by
  the same pair.
- Multi-hop traversal is not supported and should not be added casually. See
  the closing section of `docs/architecture/content-graph.md`.

## Alternatives

- **Foreign keys per relation** - fast and familiar, but the "what is attached
  to this?" question needs a hand-written union across every table, and each new
  area adds another arm to it.
- **A graph database** - solves traversal FLUX does not need, adds an operational
  component, and splits the source of truth away from the relational data the
  rest of the product needs anyway.
- **Untyped edges** (`from`, `to`, `label` as free strings) - all the flexibility
  and none of the guarantees. Typos become data.
