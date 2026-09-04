# FLUX — IDENTITY, AUTHORIZATION AND TRUST MODEL

## Scope

Define how accounts, profiles, creators, roles and permissions interact without allowing UI state to become a security boundary.

## Identity

A single account may participate in multiple domains:

```text
User
├── Profile
├── Creator
├── Community memberships
├── Follows
├── Messages
├── Library
└── Commerce identity
```

Identity is global; permissions are contextual.

## Authorization

Authorization is evaluated server-side for every protected operation.

```text
Request
→ authenticate
→ load subject
→ load resource context
→ evaluate policy
→ execute command
```

## Roles

Global roles can include:

```text
USER
CREATOR
ARTIST
MODERATOR
PLATFORM_MODERATOR
ADMIN
```

Community and store roles are scoped to their resource.

## Permission composition

```text
Global capability
+ resource ownership
+ scoped role
+ explicit policy
= effective permission
```

Deny by default.

## Impersonation / administrative access

Privileged operations require explicit audit records and must never silently change the acting identity in domain data.

## Trust boundaries

```text
Browser / Mobile
      ↓ untrusted
API boundary
      ↓ validated
Domain command
      ↓ authorized
Persistence / side effect
```

Uploads, webhooks, realtime messages and third-party integrations are also untrusted boundaries.

## Session security

Session implementation is replaceable, but must provide expiry, revocation, secure secret handling and CSRF protection where applicable.

## Abuse controls

Authorization is necessary but not sufficient. Rate limits, moderation, upload limits and anomaly detection can be layered on top of domain permissions.

## Invariant

A hidden button, disabled input or client-side role check is never considered authorization.
