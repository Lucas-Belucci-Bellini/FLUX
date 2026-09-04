# FLUX — PHASE 0 IMPLEMENTATION STATUS

## Purpose

Register what is physically implemented in the web application without claiming backend functionality that does not exist yet.

## Current executable surface

```text
/
├── Home
├── /login
├── /profile
├── /search?q=...
├── /video/:id
└── /diagnostics
```

These routes establish the first web navigation skeleton and the main content-graph entry points.

## Implemented now

### Application shell

- Next.js App Router application.
- Shared desktop sidebar.
- Shared mobile navigation.
- Global header.
- Universal search form contract.
- Theme boot support through `@flux/ui`.
- Skip-to-content accessibility control.
- Brazilian Portuguese document language.

### Identity surface

`/login` exists as the authentication UI boundary.

It deliberately does not simulate a successful session. Authentication providers, session persistence and server-side authorization remain Phase 1 backend work.

`/profile` exists as the profile presentation boundary.

It deliberately does not invent persisted user data. Real profile projections attach when the identity/domain adapters are connected.

### Content surface

`/video/:id` establishes the canonical video route.

The page reserves explicit boundaries for:

- player/media
- creator relation
- community relation
- playlist relation
- music relation
- products
- discussion

This prevents the player page from becoming a disconnected feature later.

### Discovery surface

`/search` accepts a normal GET query string and exposes the universal result categories defined by the search contract.

The current page does not claim to have a production search index. Indexing, ranking and permissions-aware result retrieval remain discovery/search implementation work.

## Explicitly not implemented

- production authentication provider
- persistent sessions
- PostgreSQL-backed users/profiles
- real media upload/playback
- comments persistence
- social reactions persistence
- community persistence
- music playback infrastructure
- live infrastructure
- marketplace checkout
- recommendation model
- production search index
- realtime transport

## Phase 0 completion rule

Phase 0 is complete only when the web application can be installed, typechecked, tested and built successfully from a clean checkout, with no route relying on permanent fake business data.

The repository must be verified with:

```bash
npm install
npm run typecheck
npm run test
npm run build
```

CI or a local clean checkout is the authority for the actual verification result; documentation must not mark the phase complete merely because files exist.

## Next implementation order

```text
Phase 0 verification
→ Phase 1 real auth + profile persistence
→ Phase 2 video + creator domain
→ Phase 3 feed + discovery
→ Phase 4 comments + social
```

## Architectural rule

The website is a consumer of domain contracts, not the owner of the data model.

Pages may define presentation and interaction boundaries, but persistence, authorization, business invariants and cross-domain relationships remain below the web layer.
