# FLUX — DOCUMENTATION INDEX

## Authority

```text
PRODUCT VISION
      ↓
MASTER ARCHITECTURE
      ↓
ARCHITECTURE CONTRACTS
      ↓
DOMAIN SPECIFICATIONS
      ↓
PRODUCT / UX SPECIFICATIONS
      ↓
IMPLEMENTATION DOCUMENTS
      ↓
EXPERIMENTS / NOTES
```

A lower-level document must not silently override a higher-level architectural rule.

## Core architecture

- `ARCHITECTURE.md`
- `docs/architecture/FLUX MASTER ARCHITECTURE.md`
- `docs/architecture/FLUX TECHNOLOGY STACK DECISION.md`
- `docs/architecture/CONTENT GRAPH SPECIFICATION.md`
- `docs/architecture/DATA OWNERSHIP AND CONSISTENCY.md`
- `docs/architecture/FLUX DATA MODEL AND DOMAIN CONTRACTS.md`
- `docs/architecture/IDENTITY AUTHORIZATION AND TRUST MODEL.md`
- `docs/architecture/REALTIME AND EVENTING CONTRACT.md`
- `docs/architecture/FLUX API AND APPLICATION CONTRACT.md`
- `docs/architecture/FLUX WEB APPLICATION ARCHITECTURE.md`

## Media / discovery / experience

- `docs/architecture/FLUX MEDIA PIPELINE AND STORAGE.md`
- `docs/architecture/SEARCH AND DISCOVERY ARCHITECTURE.md`
- `docs/architecture/PLAYER EXPERIENCE AND CROSS-DOMAIN UX.md`

## Product / website MVP

- `docs/product/FLUX WEBSITE MVP SCOPE.md`
- `docs/product/FLUX INFORMATION ARCHITECTURE.md`
- `docs/product/FLUX DESIGN SYSTEM.md`

## Domains

- `docs/domains/COMMUNITY SYSTEM.md`
- `docs/domains/VIDEO AND CREATOR PLATFORM.md`
- `docs/domains/MUSIC SYSTEM.md`
- `docs/domains/LIVE SYSTEM.md`
- `docs/domains/FLUX AUTH AND PROFILE SYSTEM.md`
- `docs/domains/FLUX VIDEO AND FEED CONTRACT.md`
- `docs/domains/FLUX COMMUNITY AND SOCIAL CONTRACT.md`
- `docs/domains/FLUX SEARCH AND DISCOVERY CONTRACT.md`
- `docs/domains/FLUX NOTIFICATION SYSTEM.md`

## Safety / commerce

- `docs/architecture/MODERATION AND TRUST SAFETY.md`
- `docs/architecture/COMMERCE AND MARKETPLACE ARCHITECTURE.md`

## Source material

The main product requirements are maintained in `README.md`, `ROADMAP.md`, and the original FLUX master build specification used to establish the platform vision.

## Rule for new documents

Create a dedicated specification when a concern has its own:

```text
ownership
lifecycle
API
persistence
security boundary
performance characteristics
failure modes
or compatibility policy
```

Avoid both extremes: giant documents that hide contracts and isolated notes with no authority relationship.

## First website baseline

The first executable website should be able to implement the following chain without inventing a second domain model:

```text
Authentication
→ Profile
→ Home
→ Feed
→ Video
→ Comment
→ Community
→ Post
→ Search
```

## Status

This index is intentionally living. New domain and engineering specifications must be added here when they become authoritative.
