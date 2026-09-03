# FLUX documentation

Start here.

## Understanding the system

- [`architecture/overview.md`](architecture/overview.md) - the short tour
- [`architecture/content-graph.md`](architecture/content-graph.md) - the central
  idea, in full: nodes, edges, the relation contract, how it is queried and
  stored
- [`../ARCHITECTURE.md`](../ARCHITECTURE.md) - layers, ports, events, posture on
  security and performance

## Decisions

[`architecture/decisions/`](architecture/decisions/) holds one record per
decision with lasting consequences: the context, what was chosen, and what that
costs. Read these before proposing a change that contradicts one.

| ADR | Decision |
| --- | -------- |
| [0001](architecture/decisions/ADR-0001-npm-workspaces-monorepo.md) | npm workspaces, no build orchestrator |
| [0002](architecture/decisions/ADR-0002-content-graph.md) | content is a typed edge set with a closed relation contract |
| [0003](architecture/decisions/ADR-0003-start-as-a-modular-monolith.md) | start as a modular monolith |
| [0004](architecture/decisions/ADR-0004-defer-infrastructure.md) | infrastructure arrives with the phase that needs it |
| [0005](architecture/decisions/ADR-0005-authorisation-is-server-side.md) | authorisation is server-side and denied by default |
| [0006](architecture/decisions/ADR-0006-licence.md) | AGPL-3.0-only (proposed - worth confirming) |

## Per-area documentation

Each area gets a document when it is built, not before:

| Area | Document | Phase |
| ---- | -------- | ----- |
| Database | [`database/`](database/) | 1 |
| API | [`api/`](api/) | 1 |
| Video | `video/` | 2 |
| Communities | `communities/` | 5 |
| Moderation | `moderation/` | 6 |
| Music | `music/` | 8 |
| Marketplace | `marketplace/` | 10 |
| Deployment | `deployment/` | 12 |

## Working on FLUX

- [`../CONTRIBUTING.md`](../CONTRIBUTING.md) - workflow, conventions, definition
  of done
- [`../ROADMAP.md`](../ROADMAP.md) - the build order
