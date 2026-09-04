# FLUX — MODERATION, TRUST AND SAFETY

## Purpose

Moderation is a platform capability, not a feature bolted onto communities later.

## Scope

```text
Users
Profiles
Videos
Shorts
Posts
Comments
Messages
Communities
Lives
Products
Reviews
```

## Core objects

```text
Report
ModerationCase
ModerationAction
Warning
Mute
Restriction
Suspension
Ban
Appeal
Evidence
PolicyRule
```

## Pipeline

```text
Content / Account
→ Report or automated signal
→ Case creation
→ Evidence collection
→ Policy evaluation
→ Action
→ Notification
→ Appeal / review
→ Audit record
```

## Enforcement levels

```text
CONTENT_HIDE
LABEL
LIMIT_DISTRIBUTION
REMOVE_CONTENT
MUTE
RESTRICT
SUSPEND
BAN
```

The exact action depends on policy and context.

## Scoped authority

Community moderators may act inside their communities according to delegated permissions. Platform moderators can enforce platform-wide policies. No lower scope can escalate its own authority silently.

## Evidence

Moderation decisions should record the relevant evidence references and policy rule without unnecessarily storing sensitive copies of media.

## Anti-abuse

Support rate limits, report deduplication, brigading detection, moderator audit logs and abuse escalation.

## Appeal

High-impact enforcement must have a defined review path unless an emergency safety policy explicitly says otherwise.

## Invariant

Moderation state is authoritative domain data. Client-side hiding is not enforcement.
