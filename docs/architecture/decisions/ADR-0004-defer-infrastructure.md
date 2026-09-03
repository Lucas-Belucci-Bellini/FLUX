# ADR-0004: infrastructure arrives with the phase that needs it

- **Status:** accepted
- **Date:** 2026-09-03
- **Phase:** 0

## Context

A platform of this shape eventually wants PostgreSQL, Redis, object storage, a
CDN, a job queue, a search engine and a transcoder. Provisioning all of it up
front is the usual instinct: the architecture diagram has boxes, so the boxes
get created.

Every one of those is a dependency a new contributor must install, a failure
mode in CI, and a thing to keep running before it does anything useful.

## Decision

Phase 0 ships with **no external services at all**. Each piece of infrastructure
is introduced in the phase that has a concrete use for it, and the reason is
recorded then.

`.env.example` lists the deferred variables, commented out and annotated with
the phase that turns them on - so the shape of the system stays visible without
being mandatory.

To make this workable, every repository sits behind a port with an in-memory
adapter. With `DATABASE_URL` unset, the whole product runs on those.

## Consequences

Good:

- `npm install && npm run dev` on a clean machine. No Docker, no services.
- The test suite needs no fixtures, no containers and no cleanup, so it runs in
  seconds and is deterministic.
- Each dependency, when it arrives, is justified by something that exists rather
  than by something anticipated.

Bad, and accepted:

- Two adapters per repository. Mitigated by running one shared test suite
  against the port, so both are held to the same specification.
- The in-memory adapter loses data on restart and does not scale past one
  process. It is a development and test tool, and `/diagnostics` says so plainly
  in the UI.
- Some PostgreSQL-specific behaviour (transaction isolation, constraint
  violations) is not exercised until the real adapter lands. Integration tests
  against a real database arrive with it in phase 1.

## Deferred, with triggers

| Component      | Arrives  | Because                                             |
| -------------- | -------- | --------------------------------------------------- |
| PostgreSQL     | phase 1  | accounts must outlive a process restart              |
| Object storage | phase 2  | video files cannot live in the database             |
| Transcoding    | phase 2  | encoding must not share a request process           |
| Redis          | phase 7  | presence and rate limits need shared, expiring state|
| Job queue      | phase 7  | fan-out and indexing outgrow request time           |
| Search engine  | phase 3+ | only once PostgreSQL indexes stop answering well    |
| CDN            | phase 12 | applied against measurements, not in advance        |
