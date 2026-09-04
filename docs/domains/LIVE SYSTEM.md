# FLUX — LIVE SYSTEM

## Scope

Live sessions provide low-latency broadcast, audience interaction, chat and optional commerce/community context.

## Session lifecycle

```text
SCHEDULED
→ STARTING
→ LIVE
→ ENDING
→ ENDED
→ REPLAY_PROCESSING
→ REPLAY_READY / RETENTION_EXPIRED
```

## Live session relations

```text
Creator
Community
Products
Music
Event
```

Cross-domain relationships are represented through the Content Graph.

## Channels

A live session has separate streams of concern:

```text
Media stream
Chat stream
Presence / audience state
Commerce surface
Moderation
```

Do not couple broadcast transport to chat persistence.

## Audience

Viewer state is ephemeral where possible. Durable actions such as follows, messages, purchases and reactions use their owning domains.

## Moderation

Live moderation must support rate limits, message actions, user restrictions and session-level controls.

## Failure behavior

A dropped realtime connection must not lose durable chat/messages or commerce state. Reconnection should rehydrate from authoritative state plus newer events.

## Replay

When recordings are produced, the replay is a media asset related to the original live session, not a replacement for the event history of the live itself.
