# API

Organised by domain, never as one endpoint that does everything. The routes
marked ✅ exist; the rest arrive with their phase.

```
/api/auth          ✅ registration and sessions
/api/users         ✅ accounts and profiles
/api/videos           video CRUD, visibility, playback     phase 2
/api/shorts                                                phase 2
/api/comments                                              phase 4
/api/communities                                           phase 5
/api/posts                                                 phase 6
/api/music                                                 phase 8
/api/live                                                  phase 9
/api/shop                                                  phase 10
/api/search                                                phase 3
/api/notifications                                         phase 7
```

## Implemented

| Method | Path | Does |
| ------ | ---- | ---- |
| POST | `/api/auth/register` | Create an account, start a session. `201` with the account; `409` if the handle or email is taken; `422` with per-field messages. |
| GET | `/api/auth/session` | Who am I? `{ user: … \| null }` - never a 401, because "signed out" is an answer. |
| POST | `/api/auth/session` | Sign in with a handle **or** an email. `401` for both a wrong password and an unknown account, with the same message. |
| DELETE | `/api/auth/session` | Sign out this session only. Other sessions survive. |
| GET | `/api/users/me` | The signed-in account, including its private fields. `401` when signed out. |
| PATCH | `/api/users/me` | Edit your own profile. The target is the session, never a field in the body. |
| GET | `/api/users/:handle` | A public profile. `404` for a suspended account - whether one exists is not a stranger's business. |

The session token never appears in a response body. It is set as an `HttpOnly`
cookie, so page scripts cannot read it.

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
