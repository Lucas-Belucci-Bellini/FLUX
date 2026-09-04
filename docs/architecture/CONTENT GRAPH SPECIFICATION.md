# FLUX — CONTENT GRAPH SPECIFICATION

## Purpose

The Content Graph is the shared relationship model connecting multimedia, community, social, music, live and marketplace experiences.

## Node model

Every graph node is addressed by a stable typed reference:

```text
{ kind, id }
```

Examples:

```text
VIDEO / vid_123
COMMUNITY / com_456
PRODUCT / prod_789
TRACK / trk_321
```

## Edge model

```text
Edge
├── id
├── from
├── relation
├── to
├── createdAt
├── createdBy
├── visibility
└── metadata
```

## Relation registry

The legal relations must be centrally declared. Examples:

```text
VIDEO --CREATED_BY--> CREATOR
VIDEO --IN_COMMUNITY--> COMMUNITY
VIDEO --USES_TRACK--> TRACK
VIDEO --IN_PLAYLIST--> PLAYLIST
VIDEO --FEATURES_PRODUCT--> PRODUCT
VIDEO --RELATED_LIVE--> LIVE
POST --IN_COMMUNITY--> COMMUNITY
TRACK --BY_ARTIST--> ARTIST
PRODUCT --SOLD_BY--> STORE
LIVE --HOSTED_BY--> CREATOR
LIVE --IN_COMMUNITY--> COMMUNITY
```

## Invariants

- A relation cannot be created if its source/target kinds are illegal.
- A relation cannot bypass visibility rules.
- Deleted or inaccessible nodes must not appear as valid public graph targets.
- Ownership and moderation checks occur before mutation.
- Graph edges are not a replacement for domain ownership.

## Query model

The graph supports bounded queries:

```text
neighbors
context
related
path-with-limit
reverse-relations
```

No endpoint may expose an unbounded traversal.

## Use cases

The graph powers:

```text
Related Content
Creator Pages
Community Context
Product Shelves
Music Discovery
Search Expansion
Recommendation Candidates
Event Discovery
```

## Anti-corruption rule

The graph must not become a dumping ground for arbitrary application state. Domain-specific state remains owned by its domain.

## Future evolution

Graph storage may begin relationally. A specialized graph projection can be introduced only when measured traversal workloads justify it.
