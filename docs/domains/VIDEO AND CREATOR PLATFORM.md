# FLUX — VIDEO AND CREATOR PLATFORM

## Scope

The video domain owns video lifecycle and the creator experience surrounding published content.

## Video lifecycle

```text
DRAFT
→ UPLOADING
→ PROCESSING
→ REVIEW / POLICY CHECK
→ PUBLISHED
→ UPDATED
→ UNLISTED / PRIVATE
→ ARCHIVED / DELETED
```

## Video metadata

```text
id
creatorId
title
description
thumbnail
media references
duration
visibility
category
tags
createdAt
updatedAt
```

Engagement counters and analytics projections are separate from immutable content identity.

## Creator

Creator is a role/domain profile with content ownership, analytics, community participation and optional commerce capabilities.

## Creator Studio

```text
Overview
Content
Analytics
Comments
Live
Monetization
Store
Community
Settings
```

Studio actions must call the same domain commands as public APIs rather than maintaining a parallel content model.

## Publication

Publishing is a domain command that validates ownership, content readiness, visibility and applicable moderation state before emitting `VIDEO_PUBLISHED`.

## Shorts

Shorts are optimized for vertical discovery but reuse shared identity, creator, comments, reactions, moderation and graph infrastructure where semantics are compatible.

## Cross-domain links

Video may relate to:

```text
Creator
Community
Playlist
Track
Product
Live
Discussion
Event
```

The Content Graph owns the relationship; video remains the owner of video state.
