# Roadmap

FLUX is built in order. **A phase is never started while the one before it is
broken.** The list below is mirrored in `apps/web/src/lib/roadmap.ts`, which is
what the product itself reads - so the UI can never claim to be further along
than it is.

Each phase ends the same way: tests pass, the build passes, documentation is
updated, and the work is committed. A phase is not "done" because the code was
written; it is done because it was verified.

---

## Status

| Phase | Name                          | Status       |
| ----- | ----------------------------- | ------------ |
| 0     | Foundation                    | **done**     |
| 1     | Authentication and profiles   | **done**     |
| 2     | Video and creators            | **building** |
| 3     | Feed, discovery and search    | planned      |
| 4     | Comments and social graph     | planned      |
| 5     | Communities                   | planned      |
| 6     | Posts and moderation          | planned      |
| 7     | Realtime and messages         | planned      |
| 8     | Music                         | planned      |
| 9     | Live                          | planned      |
| 10    | Marketplace                   | planned      |
| 11    | Recommendation                | planned      |
| 12    | Optimisation and security     | planned      |

---

## Phase 0 - Foundation ✅

The ground everything else stands on.

- npm-workspaces monorepo; `apps/web`, `packages/core`, `packages/ui`
- **the content graph**: 17 node kinds, 12 edge kinds, a closed relation
  contract, an in-memory adapter and the port the PostgreSQL adapter will fill
- kernel: branded sortable ids, `Result`, the error vocabulary, the event bus
  with wildcard subscriptions, cursor pagination, an injectable clock
- the FLUX design system: OKLCH tokens, light / dark / system themes with no
  flash of the wrong theme, and the first primitives
- the app shell: sidebar, adaptive mobile navigation, universal search field
- `/diagnostics`, which reads the running process rather than a written summary
- toolchain: strict TypeScript, ESLint with the kernel-isolation rule, Prettier,
  Vitest, and `npm run verify`

**Verified:** 52 tests pass, lint clean, every workspace type-checks, the
production build succeeds, and all routes were rendered in a browser at three
widths in both themes with no horizontal overflow and no console errors.

## Phase 1 - Authentication and profiles ✅

Accounts before anything that belongs to an account.

- `User` and `Profile`, split so that `publicProfile()` is the only way an
  account reaches another person - the email cannot leak by omission
- handles: folded for uniqueness, reserved-name list covering every route and
  every impersonable name, plus a confusable fold so `@f1ux` is catchable
- passwords: scrypt from `node:crypto` (no native dependency), self-describing
  hashes so cost parameters can be raised without invalidating anyone
- sessions: opaque and server-side so they are revocable; the cookie holds a
  random token, the store holds an HMAC of it, so a database leak is not a pile
  of usable sessions. Absolute lifetime and idle expiry, both enforced
- **RBAC**: platform roles now, per-community roles modelled for phase 5,
  deny-by-default, suspension overriding every grant
- registration, sign-in, sign-out, public profiles, profile editing
- `/api/auth/*` and `/api/users/*`, with one error envelope and one status map

**Verified:** 113 unit tests, plus 25 end-to-end checks in a real browser
covering the authorisation paths - a signed-out request to `/api/users/me` is
401, one account cannot rename another, sign-in answers identically for an
unknown account and a wrong password, and the session cookie is HttpOnly and
unreadable from JavaScript.

## Phase 2 - Video and creators (building)

- `Video`, `Short`, `Creator`; the upload contract and its states
- visibility rules (public / unlisted / private) enforced on the server
- playback, view counting that resists trivial inflation, likes
- Creator Studio: content list, basic analytics surface
- graph edges become real: `authored_by`, `belongs_to`, `tagged`, `derived_from`

## Phase 3 - Feed, discovery and search

- Home sections backed by a feed port, not by page-level queries
- Explore, Trending, Categories
- universal search across every node kind, one result shape
- Library, History, Watch later, Liked

## Phase 4 - Comments and social graph

- threaded comments with a bounded depth and a stable ordering
- reactions, follows, mentions
- the moderation hooks that phase 6 grows into

## Phase 5 - Communities

- communities, and **subcommunities nested arbitrarily deep**
  (`War Thunder → Germany → Aviation → Jets`)
- text and voice channels, membership, per-community roles and permissions
- community-scoped content: a video posted *in* a community

## Phase 6 - Posts and moderation

- post types: text, image, video, poll, link, question, guide, announcement
- voting, saving, sharing
- reports, moderation actions, bans, mutes, warnings, and an audit trail that
  outlives the moderator

## Phase 7 - Realtime and messages

- presence, direct messages, group messages, community messages
- the transport that live chat and voice channels will reuse
- first process split: `services/realtime`

## Phase 8 - Music

- artists, albums, tracks, playlists
- the player that survives navigation across the whole app
- the video ↔ music edges: `features`, `performed_by`, `contains`

## Phase 9 - Live

- broadcasts, viewers, chat, notifications
- lives linked to communities, events and products
- `derived_from` turns an ended live into a video

## Phase 10 - Marketplace

- stores, products, categories, cart, orders, reviews
- `ProductShelf` under videos, shorts and lives
- live shopping: video, chat and products in one surface

## Phase 11 - Recommendation

Signals first, ranking second. Watch history, likes, subscriptions, community
membership, search terms, completion rate, engagement - collected and inspectable
before anything ranks on them.

## Phase 12 - Optimisation and security

Caching, CDN, image and media delivery, rate limiting, a security review pass and
observability - applied against measurements, not in advance.

---

## Working agreement per phase

```
1. Inspect    what exists, and what the phase actually needs
2. Plan       write the contract before the implementation
3. Implement  the smallest thing that satisfies the contract
4. Test       unit, integration, and the authorisation path
5. Build      the production build must pass
6. Fix        until all of the above is green
7. Document   ARCHITECTURE.md, docs/, and an ADR if a decision was made
8. Commit     one clear commit per meaningful step
```
