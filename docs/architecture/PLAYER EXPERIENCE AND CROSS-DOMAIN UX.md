# FLUX — PLAYER EXPERIENCE AND CROSS-DOMAIN UX

## Principle

The UI should make FLUX feel like one connected platform rather than several products placed beside each other.

## Core journey

```text
Discover video
→ creator
→ community
→ discussion
→ playlist / music
→ product
→ live
→ return to content
```

## Navigation contract

Primary destinations:

```text
Home
Explore
Shorts
Communities
Music
Live
Shop
```

Secondary user areas:

```text
Library
History
Watch Later
Liked
Following
Your Communities
```

## Persistent player

The global player keeps playback state while navigation changes. UI routing must not destroy the playback session unnecessarily.

## Contextual surfaces

Content pages may expose related graph context:

```text
Creator
Community
Tracks
Playlist
Products
Live
Related Discussions
Events
```

The same graph relation contract should drive these surfaces.

## Responsive strategy

Desktop is a primary information-density target, while mobile receives adapted navigation and interaction patterns rather than a shrunken desktop layout.

## Accessibility

Every interactive surface must expose semantic names, keyboard paths, focus state, readable contrast and reduced-motion behavior where applicable.

## No false architecture

Mock content is acceptable for visual development, but UI contracts must be compatible with real API responses from the beginning.
