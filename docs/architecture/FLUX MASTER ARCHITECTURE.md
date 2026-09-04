# FLUX — MASTER ARCHITECTURE

## 1. Purpose

This document is the integration map for FLUX. It defines the architectural boundaries between product domains, platform services, data, realtime behavior, media processing, discovery and the Content Graph.

FLUX is a connected multimedia platform, not a collection of cloned applications.

```text
Video + Shorts + Live + Music + Communities + Social + Marketplace
                         ↓
                    CONTENT GRAPH
                         ↓
             Discovery / Context / Identity
```

## 2. Product principle

> **Do not force the user to leave FLUX to follow a relationship that FLUX already knows exists.**

A video may relate to a creator, community, discussion, playlist, track, product, live session and event. The same relationship model should power UI, search, recommendation and discovery.

## 3. Architectural shape

```text
                   EXPERIENCE LAYER
        web / mobile / desktop / responsive UI
                           ↓
                  APPLICATION LAYER
       routes / actions / controllers / view-models
                           ↓
                     DOMAIN LAYER
 video / community / social / music / live / shop / search
                           ↓
                    CONTENT GRAPH
               typed nodes + typed relations
                           ↓
                   CORE CONTRACTS
      ids / results / errors / events / paging / clock
                           ↓
                PORTS / INFRASTRUCTURE
 PostgreSQL / object storage / cache / queues / realtime
```

## 4. Domain boundaries

Domains must own their rules and data contracts.

```text
Auth / Identity
Profiles / Creators
Video / Shorts
Communities
Social / Posts / Comments
Messaging / Presence
Music
Live
Marketplace
Search
Recommendation
Notifications
Moderation / Safety
```

Cross-domain integration must happen through explicit contracts, graph relations, queries and events rather than hidden imports into another domain's persistence code.

## 5. Content Graph

The graph is the product-level integration backbone.

```text
Node = { kind, id }
Edge = { from, relation, to, metadata }
```

Relations are closed and typed. Invalid relations fail at the domain boundary.

The graph is not a generic uncontrolled graph database. The legal relation catalogue remains explicit so that permissions, indexing, rendering and discovery have predictable semantics.

## 6. Core rules

- Core has no UI dependency.
- UI contains no authoritative domain rules.
- Domain modules depend on ports/contracts rather than concrete infrastructure.
- Authorization is server-side.
- External input is untrusted until validated.
- Lists are bounded and paginated.
- Long work moves to jobs/workers.
- Media bytes live in object storage/CDN paths, not relational rows.
- Realtime is an adapter/service concern, not business logic embedded in React components.
- Search and recommendation consume indexed signals; source-of-truth data remains in domain stores.

## 7. Media pipeline

```text
Upload Intent
→ Authorization
→ Direct / Controlled Upload
→ Malware / File Validation
→ Media Probe
→ Transcoding Jobs
→ Thumbnails / Previews
→ Storage
→ CDN Delivery
→ Playback Telemetry
```

## 8. Realtime pipeline

```text
Domain command
→ validated state change
→ domain event
→ realtime fan-out
→ subscribed clients
```

Realtime messages are not the source of truth; they notify clients about state that can be queried again.

## 9. Search pipeline

```text
Domain change
→ event
→ indexing job
→ search document
→ query
→ ranked results
```

Search indexes are disposable projections. They can be rebuilt from source data.

## 10. Recommendation pipeline

Start with transparent deterministic signals and evolve later.

```text
history
likes
follows
communities
searches
completion
engagement
relationships
      ↓
feature aggregation
      ↓
candidate generation
      ↓
ranking
      ↓
policy / safety filters
      ↓
feed
```

Recommendation must never bypass moderation, visibility or authorization rules.

## 11. Marketplace boundary

Commerce state is transactional.

```text
Catalog
→ Cart
→ Order
→ Payment integration boundary
→ Fulfillment / order state
→ Notifications
```

Content linkage to products is discovery metadata; it must not mutate financial state.

## 12. Realtime community boundary

Community channels, presence and voice/chat capabilities remain separate contracts even when presented together in the UI.

## 13. Deployment evolution

Start as a modular monolith with hard internal seams. Split processes only when measured load or operational requirements justify it.

```text
Current target
→ modular monolith

Later
→ media service
→ transcoding workers
→ realtime service
→ search/indexing service
→ notification workers
```

## 14. Runtime modes

```text
LOCAL DEV
TEST
PREVIEW
PRODUCTION
BACKGROUND WORKER
CRON / SCHEDULED JOB
REALTIME GATEWAY
```

## 15. Non-goals

Do not copy the code, branding, visual identity, proprietary implementation or protected textual content of other platforms used as product references. FLUX owns its implementation and product expression.

## 16. Completion gate

A domain is ready to expand when its ownership, public contracts, persistence model, event model, authorization, tests, observability and failure behavior are documented.
