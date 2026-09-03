# ADR-0006: AGPL-3.0-only

- **Status:** proposed - confirm before the first public release
- **Date:** 2026-09-03
- **Phase:** 0

## Context

The repository needed a licence, and no preference had been stated. A hosted
social platform has a licensing property most projects do not: the primary way
people would use a modified copy is by *running it as a service*, which
distribution-triggered copyleft (GPL) does not reach.

## Decision

**AGPL-3.0-only**, matching the licence chosen by comparable hosted social
platforms (Mastodon, Discourse, PeerTube).

## Consequences

- Anyone running a modified FLUX as a network service must offer their source.
- Contributions arrive under the same terms.
- Commercial adopters who want to keep modifications private cannot, unless the
  copyright holder offers a separate licence. That option stays open while
  copyright is held in one place.

## This one is worth revisiting

Unlike the other decisions here, this was made without input, because the
alternative was to block the build on a question. If the intention is permissive
reuse - other people embedding FLUX in closed products - **MIT or Apache-2.0 is
the right choice instead**, and switching now is a one-file change. It becomes
much harder once outside contributions arrive, because every contributor would
have to agree.
