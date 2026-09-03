# API

Route handlers land in **phase 1**, with the first thing worth authorising.
This document records the contract they will follow.

## Shape

Organised by domain, never as one endpoint that does everything:

```
/api/auth          sessions
/api/users         accounts and profiles
/api/videos        video CRUD, visibility, playback
/api/shorts
/api/comments
/api/posts
/api/communities
/api/music
/api/live
/api/shop
/api/search
/api/notifications
```

## Rules

**Validation.** Every request body and query string is parsed by a Zod schema
before it reaches domain code. The same schema validates in the browser, so the
two cannot disagree - but the server never trusts the browser's result.

**Authorisation.** Decided server-side on every request, denied by default. See
[ADR-0005](../architecture/decisions/ADR-0005-authorisation-is-server-side.md).

**Errors.** One shape, derived from the kernel's error vocabulary:

```json
{ "code": "forbidden", "message": "You do not have permission to do that.", "details": {} }
```

`code` maps to the HTTP status in exactly one place
(`packages/core/src/errors.ts`), so a status is never chosen ad hoc at a call
site. `details` is machine-readable and must never carry secrets - it reaches
clients.

**Paging.** Every collection endpoint accepts `?cursor=&limit=` and returns
`{ items, nextCursor }`. `limit` is clamped to `MAX_PAGE_SIZE` rather than
rejected, so a well-meaning client with a large limit still works.

**Ids.** Path and query ids pass through `parseId()` before use.

## Not yet decided

- Whether public read endpoints get a GraphQL or tRPC layer. Not before there is
  a client whose needs REST handles badly.
- Rate limiting policy per endpoint class. Phase 12, alongside Redis.
