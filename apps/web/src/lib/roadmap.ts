/**
 * The build order, in code.
 *
 * The sidebar, the home page and the diagnostics page all read this, so the
 * product can never claim to be further along than it is. ROADMAP.md carries
 * the same list in prose; this is the copy the UI trusts.
 */

export type PhaseStatus = 'done' | 'active' | 'planned';

export interface Phase {
  readonly number: number;
  readonly title: string;
  readonly summary: string;
  readonly status: PhaseStatus;
}

export const PHASES: readonly Phase[] = [
  {
    number: 0,
    title: 'Foundation',
    summary: 'Monorepo, kernel, content graph, design system, runnable app.',
    status: 'done',
  },
  {
    number: 1,
    title: 'Authentication and profiles',
    summary: 'Accounts, sessions, roles, permissions enforced on the server.',
    status: 'active',
  },
  {
    number: 2,
    title: 'Video and creators',
    summary: 'Videos, shorts, creator profiles, upload and playback contracts.',
    status: 'planned',
  },
  {
    number: 3,
    title: 'Feed, discovery and search',
    summary: 'Home sections, explore, trending, universal search.',
    status: 'planned',
  },
  {
    number: 4,
    title: 'Comments and social graph',
    summary: 'Threaded discussion, reactions, follows, mentions.',
    status: 'planned',
  },
  {
    number: 5,
    title: 'Communities',
    summary: 'Communities, subcommunities, channels, roles, membership.',
    status: 'planned',
  },
  {
    number: 6,
    title: 'Posts and moderation',
    summary: 'Post types, voting, reports, moderation actions and audit trail.',
    status: 'planned',
  },
  {
    number: 7,
    title: 'Realtime and messages',
    summary: 'Presence, direct and group messages, live channel transport.',
    status: 'planned',
  },
  {
    number: 8,
    title: 'Music',
    summary: 'Artists, albums, tracks, playlists and the persistent player.',
    status: 'planned',
  },
  {
    number: 9,
    title: 'Live',
    summary: 'Broadcasts, chat, viewers, notifications, linked products.',
    status: 'planned',
  },
  {
    number: 10,
    title: 'Marketplace',
    summary: 'Stores, products, cart, orders, reviews, product shelves.',
    status: 'planned',
  },
  {
    number: 11,
    title: 'Recommendation',
    summary: 'Signal collection first, ranking second. No black box on day one.',
    status: 'planned',
  },
  {
    number: 12,
    title: 'Optimisation and security',
    summary: 'Caching, CDN, rate limiting, hardening, observability.',
    status: 'planned',
  },
];

export const currentPhase: Phase =
  PHASES.find((phase) => phase.status === 'active') ?? (PHASES[0] as Phase);
