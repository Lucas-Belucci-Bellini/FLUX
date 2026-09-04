# FLUX — COMMUNITY SYSTEM

## Purpose

Communities are first-class social spaces with content, conversation, moderation, roles and events.

## Community model

```text
Community
├── identity
├── rules
├── members
├── roles
├── channels
├── posts
├── media
├── events
├── moderation
└── graph relations
```

## Hierarchy

Communities can form contextual subcommunities without requiring a separate product.

```text
Game
└── Nation
    └── Vehicle / Class
```

The hierarchy is data-driven and must not assume a fixed depth unless product policy chooses one.

## Channels

```text
TEXT
MEDIA
ANNOUNCEMENT
DISCUSSION
VOICE
EVENT
```

Channel behavior is capability-based rather than hardcoded to one community type.

## Roles and permissions

Roles are scoped to a community. Permissions are explicit and deny by default.

## Membership lifecycle

```text
INVITED → JOINED → ACTIVE → MUTED / RESTRICTED → LEFT / REMOVED
```

## Content

Community content can include posts, videos, images, polls, guides, announcements and events. Content remains owned by its domain while the community relationship remains graph data.

## Moderation

Community moderators use delegated moderation capabilities documented in the trust/safety contract.

## Discovery

Community visibility participates in search, discovery and recommendation subject to privacy and moderation rules.
