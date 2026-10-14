# ADR-0007: opaque, server-side sessions with peppered token hashes

- **Status:** accepted
- **Date:** 2026-09-03
- **Phase:** 1

## Context

FLUX needs to know who is asking on every request. The two usual shapes are a
self-contained signed token (a JWT in a cookie) and an opaque token backed by a
server-side record.

The deciding question is revocation. A social platform has to be able to end a
session *now*: a password changes, an account is compromised, a moderator
suspends someone. A self-contained token stays valid until it expires, and the
usual workarounds - very short lifetimes with refresh tokens, or a deny-list
checked on every request - reintroduce the server-side lookup that the token
was supposed to avoid, with more moving parts.

## Decision

**Opaque sessions, stored server-side.**

- The cookie carries 32 random bytes, base64url. It means nothing on its own.
- What the store holds is `HMAC-SHA256(FLUX_SESSION_SECRET, token)`, never the
  token. The lookup stays a single indexed read because the HMAC is
  deterministic.
- Two expiries: a 30-day absolute lifetime that use cannot extend, and a
  14-day idle expiry refreshed on each request.
- The cookie is `HttpOnly`, `SameSite=Lax`, `Secure` outside development.

## Consequences

Good:

- Revocation is a delete. Suspension ends every session for that account in one
  call, and it takes effect on the next request.
- A leaked database is not a pile of usable sessions: an attacker also needs
  the server secret, which lives in the environment rather than in the store.
- Nothing about the user is encoded in the cookie, so roles and suspension are
  read fresh on every request rather than being as stale as the last token.
- `HttpOnly` means an XSS bug is not automatically a session theft.

Bad, and accepted:

- One store read per authenticated request. It is an indexed lookup on a
  single column; when it becomes hot, a short-TTL cache in front of it is a
  contained change behind the same port.
- Sessions are state to keep and to clean up. `deleteExpired()` exists on the
  port for that.
- Rotating `FLUX_SESSION_SECRET` invalidates every session, because every
  stored hash was computed with it. That is the intended behaviour for a
  compromised secret, and it needs saying out loud before someone rotates one
  casually.

## Notes

`SameSite=Lax` rather than `Strict` so that following a link into FLUX from
elsewhere arrives signed in; it still keeps the cookie off cross-site form
posts. State-changing routes are POST-only for the same reason - sign-out is a
form, not a link, so it cannot be triggered by a prefetch or a crawler.
