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
IMPLEMENTATION DOCUMENTS
      ↓
EXPERIMENTS / NOTES
```

A lower-level document must not silently override a higher-level architectural rule.

## Core architecture

- `ARCHITECTURE.md`
- `docs/architecture/FLUX MASTER ARCHITECTURE.md`
- `docs/architecture/CONTENT GRAPH SPECIFICATION.md`
- `docs/architecture/DATA OWNERSHIP AND CONSISTENCY.md`
- `docs/architecture/IDENTITY AUTHORIZATION AND TRUST MODEL.md`
- `docs/architecture/REALTIME AND EVENTING CONTRACT.md`
- `docs/architecture/FLUX DATA MODEL AND DOMAIN CONTRACTS.md`

## Media / discovery / experience

- `docs/architecture/MEDIA PIPELINE AND STORAGE.md`
- `docs/architecture/SEARCH AND DISCOVERY ARCHITECTURE.md`
- `docs/architecture/PLAYER EXPERIENCE AND CROSS-DOMAIN UX.md`

## Safety / commerce

- `docs/architecture/MODERATION AND TRUST SAFETY.md`
- `docs/architecture/COMMERCE AND MARKETPLACE ARCHITECTURE.md`

## Domains

- `docs/domains/COMMUNITY SYSTEM.md`
- `docs/domains/VIDEO AND CREATOR PLATFORM.md`
- `docs/domains/MUSIC SYSTEM.md`
- `docs/domains/LIVE SYSTEM.md`

## Source material

The main product requirements are maintained in `README.md`, `ROADMAP.md`, and the FLUX master build specification used to establish the platform vision.

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

## Status

This index is intentionally living. New domain and engineering specifications must be added here when they become authoritative.
