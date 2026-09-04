# FLUX — REALTIME AND EVENTING CONTRACT

## Purpose

Unify domain events, realtime delivery and asynchronous work without making the browser the source of truth.

## Domain events

Domain modules emit facts after successful state changes.

```text
VIDEO_PUBLISHED
COMMENT_CREATED
COMMUNITY_CREATED
LIVE_STARTED
PRODUCT_CREATED
ORDER_CREATED
USER_FOLLOWED
```

## Event envelope

```text
Event
├── id
├── type
├── version
├── occurredAt
├── actor
├── correlationId
├── causationId
└── payload
```

## Reliability classes

```text
SYNC
→ request needs immediate result

ASYNC
→ job may complete later

REALTIME
→ client notification / ephemeral update

DURABLE
→ must survive process restart
```

## Realtime rule

Realtime delivery is a projection of authoritative state.

```text
command
→ transaction
→ durable state
→ event
→ realtime notification
```

A lost realtime message must not corrupt state.

## Presence

Presence is ephemeral and has expiration/heartbeat semantics. It must not be treated as historical truth.

## Chat / messaging

Messages are durable domain objects; websocket delivery is only the transport path for low-latency updates.

## Ordering

Consumers should rely on event IDs, versions and timestamps instead of assuming network packet order.

## Idempotency

Consumers that trigger side effects must tolerate duplicate delivery using event IDs or idempotency keys.

## Future transport

The in-process bus may evolve to a queue or broker while domain emitters retain the same event contract.
