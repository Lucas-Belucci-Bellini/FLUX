# ADR-0005: authorisation is decided on the server, and denied by default

- **Status:** accepted
- **Date:** 2026-09-03
- **Phase:** 0 (contract), enforced from phase 1

## Context

FLUX will carry per-community roles, creator-owned content, private videos,
stores and moderation powers. Permission checks will appear in hundreds of
places. The common failure is a check that exists only in the UI - a hidden
button, a filtered list - which is a suggestion, not a control.

## Decision

1. **Every authorisation decision is made on the server, per request.** UI
   affordances follow the decision; they never constitute it.
2. **Deny by default.** A capability with no explicit grant is denied. A new
   permission that nobody has mapped yet is denied, not open.
3. **Permissions are declared in one place**, alongside the roles that hold
   them, so "who can do this?" has a single answer to read.
4. **Untrusted input is parsed at the boundary**: one Zod schema per payload
   used on both sides of the wire, and ids from URLs and forms passed through
   `parseId()` before reaching domain code.

## Consequences

Good:

- A missing check fails closed. The worst case is a user who cannot do something
  they should be able to - visible, reported, fixed - rather than one who can do
  something they should not.
- Authorisation is testable without a browser: it is a function of actor,
  action and target.
- Adding a role does not mean auditing every call site.

Bad, and accepted:

- More round trips than trusting client state, and some duplication between the
  server decision and the UI affordance that mirrors it. Both are worth it.
- Every new capability needs an explicit grant before it works, which will feel
  like friction the first time a feature is silently denied. That is the design
  working.

## Notes

The session secret is required in production and refused at the moment of use
rather than at import time, so a production build can be made without deployment
secrets while a production *server* cannot start without them
(`apps/web/src/lib/env.ts`).
