# FLUX — NOTIFICATION SYSTEM

## Objetivo

Unificar notificações geradas por eventos de diferentes domínios.

## Sources

```text
Follow
Comment
Reply
Mention
Community event
Live started
New post
Product/order update
Moderation action
Creator publication
```

## Flow

```text
Domain Event
 ↓
Notification Policy
 ↓
Notification Record
 ↓
Delivery
```

## Channels

```text
in-app
email (future)
push (future)
```

## Notification record

```text
id
recipientId
type
sourceRef
actorRef
payload
readAt
createdAt
```

## Idempotency

A handler must not create duplicate notifications when the same event is retried.

## Aggregation

High-volume events may be aggregated:

```text
"Lucas and 34 others liked your post"
```

The underlying event records remain independent when required for audit or analytics.

## Preferences

Users may configure categories/channels. Mandatory security notifications may override normal preferences.

## Delivery failure

Failed delivery should not undo the original domain action.

## First site slice

```text
notification bell
unread count
notification list
mark read
open target resource
```
