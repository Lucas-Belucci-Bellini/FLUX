# FLUX — TECHNOLOGY STACK DECISION

## Status

**DECIDED FOR THE INITIAL PRODUCT**

The FLUX web platform will use TypeScript as the primary programming language across frontend, backend/domain packages and tooling. The initial architecture is a modular monolith with explicit ports and adapters.

This is a product decision for the current generation of FLUX. It is not a promise that every future specialized workload must use TypeScript.

## Primary language

### TypeScript

TypeScript is the default language for:

```text
apps/web
apps/mobile (when introduced)
apps/desktop (when introduced)
packages/core
packages/domain/*
services/api
services/realtime
services/worker
web tooling
SDKs
integration tests
```

Reasons:

- one strongly typed language across UI, domain and server boundaries;
- excellent fit for React/Next.js web development;
- shared types and contracts reduce drift between client and server;
- fast iteration for a social product with many interconnected domains;
- suitable for the initial modular-monolith architecture;
- mature ecosystem for web APIs, validation, testing and developer tooling.

## Runtime

### Node.js

Node.js is the initial server runtime.

The repository currently requires Node.js >= 22.12.0 and uses npm workspaces. fileciteturn277file0

Node is responsible for:

```text
HTTP/API
Realtime
Workers
Domain execution
Background jobs
Build tooling
CLI tooling
```

## Web framework

### Next.js + React + TypeScript

The public web application should use Next.js with React and TypeScript.

```text
Browser
 ↓
Next.js / React
 ↓
Application Services
 ↓
Domain Packages
 ↓
Ports
 ↓
Adapters
```

The framework owns transport and rendering concerns. Domain rules must remain framework-independent.

## Styling

### Tailwind CSS + FLUX Design System

Tailwind is an implementation utility, not the design system itself.

The source of truth for visual decisions is the FLUX design-system specification and token layer.

## Data

### PostgreSQL

PostgreSQL is the primary persistent relational database.

Domain code must not import a PostgreSQL client directly. Database access occurs through adapters implementing domain/application ports.

## Realtime

Initial realtime architecture:

```text
TypeScript
+
WebSocket-compatible transport
+
Event Bus
+
Realtime adapter
```

The transport may evolve without forcing domain modules to know the wire protocol.

## Cache / ephemeral state

Redis is optional infrastructure, not a mandatory dependency of the core domain.

Use it only when measurements justify it for:

```text
rate limiting
presence
short-lived cache
coordination
queues / streams where appropriate
```

The application must remain understandable and testable without Redis in the base development environment.

## Media processing

Video/audio transcoding is considered a specialized workload.

Initial orchestration remains TypeScript, but media processing may call specialized native tools or external services through a well-defined adapter.

The application must not implement codec internals in TypeScript merely to avoid another tool.

## Object storage / CDN

Media bytes belong in object storage plus CDN delivery, not in PostgreSQL rows.

PostgreSQL stores metadata, ownership, relationships and processing state.

## Search

The initial search implementation may use PostgreSQL indexes and full-text capabilities where appropriate.

A dedicated search engine is introduced only when measured query volume, relevance requirements or indexing cost justify the split.

## Recommendation

Initial recommendation remains application/domain logic in TypeScript with explicit feature extraction and scoring interfaces.

Do not begin with a large ML platform.

Future specialized ranking or ML workloads may be implemented in Python or another suitable environment behind a stable service boundary.

## Python

Python is **allowed but not the default application language**.

Primary uses:

```text
ML experimentation
Recommendation research
Data analysis
Offline jobs
Moderation model experiments
Analytics
Prototyping
```

Python must not become an unstructured second backend.

## Rust / C++

Rust or C++ may be introduced only for a demonstrated specialized need such as:

```text
high-performance media processing
native codec integration
CPU-intensive ranking/indexing
specialized cryptographic or systems workloads
native desktop components
```

Such components must expose a stable service/FFI boundary and must not leak implementation details into domain packages.

## Language boundary rule

```text
UI
 ↓
Application / Domain — TypeScript
 ↓
Ports / Contracts
 ↓
Adapters / Infrastructure
 ↓
Specialized runtime when justified
```

Do not create direct chains such as:

```text
React → Python → Rust → database
```

without an explicit architectural boundary.

## Shared contracts

Types, schemas and domain contracts should be kept close to the owning package.

External boundaries should use validated schemas rather than assuming that a shared TypeScript type makes runtime input trustworthy.

## Monorepo rule

The existing npm workspaces structure is the initial repository boundary:

```text
packages/*
apps/*
services/*
```

The monorepo may contain many packages without turning every package into a deployed microservice.

## Versioning rule

A new language or runtime requires a written Architecture Decision Record explaining:

```text
why current TypeScript is insufficient
performance evidence
operational cost
security impact
developer experience
ownership
interface
failure mode
migration plan
```

## Final decision

For the first real FLUX website:

```text
Language        → TypeScript
Web             → Next.js + React
Server          → Node.js
Styling         → Tailwind + FLUX Design System
Database        → PostgreSQL
Realtime        → WebSocket-compatible adapter
Cache           → Optional Redis
Media bytes     → Object Storage + CDN
ML / research   → Python when justified
Native systems  → Rust/C++ only when justified
Architecture    → Modular monolith + Ports and Adapters
```

This stack is intentionally conservative: keep one primary language while the product is small, and introduce specialized runtimes only when evidence demonstrates a real need.
