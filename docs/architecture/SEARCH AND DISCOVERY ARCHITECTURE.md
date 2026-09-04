# FLUX — SEARCH AND DISCOVERY ARCHITECTURE

## Purpose

Define universal search, discovery and recommendation as separate but connected systems.

## Search

Search covers:

```text
Videos
Shorts
Creators
Communities
Posts
Tracks
Artists
Albums
Playlists
Lives
Products
```

Search indexes are projections. PostgreSQL/domain state remains authoritative.

## Discovery

Discovery is contextual browsing:

```text
Explore
Trending
New
Popular
Categories
Following
Community context
```

## Recommendation

Recommendation is not identical to search. Search satisfies explicit intent; recommendation proposes candidates.

## Candidate pipeline

```text
Signals
→ Candidate generation
→ Eligibility filters
→ Ranking
→ Safety / visibility filters
→ Diversity / freshness policy
→ Result
```

## Signals

Initial signals may include:

```text
watch history
completion
likes
follows
subscriptions
community membership
search history
engagement
content relations
```

## Safety invariant

No recommendation or search result may expose content that the viewer is not authorized to see.

## Cold start

Use explicit interests, follows, community selection, content relationships and broad trending signals before behavioral history exists.

## Feedback loops

Recommendation metrics must account for negative feedback, not only clicks. The system should support mute, not interested, hide creator/community and moderation signals.
