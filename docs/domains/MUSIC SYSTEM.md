# FLUX — MUSIC SYSTEM

## Scope

Music is a first-class domain for tracks, artists, albums, playlists and playback state.

## Entities

```text
Artist
Album
Track
Playlist
PlaybackSession
QueueItem
```

## Player

The player is persistent across navigation and owns a playback session rather than being recreated by every page.

```text
track
queue
position
volume
repeat
shuffle
playing
```

## Relationships

```text
Track → Artist
Track → Album
Track ↔ Video
Track ↔ Playlist
Track ↔ Creator
Track ↔ Community
```

Relations are represented through the Content Graph when they cross domains.

## Playback

Playback state is separated from library ownership and social engagement. UI state must not become the authoritative source for track availability.

## Library

Users may save tracks, albums and playlists. Saved state belongs to the user's library domain.

## Discovery

Music contributes to universal search, discovery and recommendations through indexed metadata and behavioral signals.

## Rights boundary

The platform must track whether a media asset is authorized for publication/streaming before exposing it. Rights metadata is a policy/data concern and must remain distinct from the content relation itself.
