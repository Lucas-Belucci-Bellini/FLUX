# FLUX — DATA MODEL AND DOMAIN CONTRACTS

## Purpose

Define stable domain entities before the implementation grows into disconnected schemas.

## Identity entities

```text
User
Profile
Creator
Artist
```

## Content entities

```text
Video
Short
Post
Comment
Playlist
Track
Album
Live
```

## Community entities

```text
Community
CommunityMember
CommunityRole
Channel
CommunityEvent
```

## Communication entities

```text
Conversation
Message
Presence
Notification
Reaction
```

## Commerce entities

```text
Store
Product
Cart
Order
Review
```

## Trust entities

```text
Report
ModerationCase
ModerationAction
Appeal
```

## Shared rules

Every persistent entity needs:

```text
stable id
createdAt
updatedAt where mutable
visibility / lifecycle state where applicable
owner or responsible domain
```

Do not put every entity in one giant shared domain package merely because the tables reference one another.

## References

Prefer typed IDs and relation references over copying full objects into other domains.

## Versioning

Public API DTOs and persistence schemas evolve independently. Migrations must be explicit.

## Derived projections

Search documents, recommendation features, feed materializations and analytics aggregates are projections and must be rebuildable from authoritative data where practical.
