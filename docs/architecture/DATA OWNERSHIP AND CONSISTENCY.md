# FLUX — DATA OWNERSHIP AND CONSISTENCY

## Purpose

Prevent duplicated truth across domains.

## Ownership rule

Every authoritative field has one domain owner.

```text
Account / session state → Identity
Creator configuration → Creator
Video metadata → Video
Community membership → Community
Message body / state → Messaging
Track metadata → Music
Order / payment state → Commerce
Moderation decision → Moderation
Graph relations → Content Graph
```

Other domains consume projections or references, not private copies that can diverge silently.

## Derived data

Caches, search indexes, recommendation features and analytics aggregates are derived and rebuildable unless explicitly documented otherwise.

## Consistency classes

```text
STRONG
→ financial/order authorization state

TRANSACTIONAL
→ domain mutation + required invariants

EVENTUAL
→ search, recommendation, counters, notifications

EPHEMERAL
→ presence, typing indicators, transient UI state
```

## Counters

Views, likes and similar counters must declare whether the displayed value is exact transactional state, an eventually consistent projection or an analytics estimate.

## Cross-domain writes

Prefer:

```text
command to owner
→ owner changes state
→ event emitted
→ other domains update projections
```

Avoid multi-domain transactions unless a real invariant requires them.

## Deletion

Distinguish logical deletion, archival and physical deletion. References must define whether they survive deletion as tombstones or disappear from public traversal.
