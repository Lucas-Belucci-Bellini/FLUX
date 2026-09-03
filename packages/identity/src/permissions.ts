/**
 * Authorisation: who may do what.
 *
 * Two rules hold everywhere:
 *
 *  1. **Deny by default.** A permission that no role grants is denied. A
 *     permission nobody has mapped yet is denied, not open. The worst failure
 *     mode is a user who cannot do something they should - visible, reported,
 *     fixed - never one who can do something they should not.
 *  2. **This is the only definition.** Roles and their grants live here, so
 *     "who can ban someone?" has one place to read rather than a search across
 *     the codebase.
 *
 * The UI may mirror a decision made here to hide a button. It may never be the
 * decision.
 */

export const PERMISSIONS = [
  // account
  'profile:edit',
  'account:delete',

  // content (phase 2)
  'video:publish',
  'video:edit_own',
  'video:delete_own',
  'short:publish',

  // discussion (phase 4)
  'comment:create',
  'comment:edit_own',
  'comment:delete_own',
  'reaction:create',
  'follow:create',

  // communities (phase 5)
  'community:create',
  'community:join',
  'community:post',
  'community:manage',
  'channel:manage',

  // moderation (phase 6)
  'content:report',
  'moderation:review',
  'moderation:remove_content',
  'moderation:mute',
  'moderation:ban',

  // commerce (phase 10)
  'store:create',
  'product:manage',
  'order:place',

  // platform
  'platform:administer',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export function isPermission(value: unknown): value is Permission {
  return typeof value === 'string' && (PERMISSIONS as readonly string[]).includes(value);
}

/** Roles held across the whole platform. */
export const PLATFORM_ROLES = ['visitor', 'member', 'creator', 'moderator', 'admin'] as const;
export type PlatformRole = (typeof PLATFORM_ROLES)[number];

/** Roles held inside one community. Enforced from phase 5; modelled now. */
export const COMMUNITY_ROLES = ['guest', 'member', 'contributor', 'moderator', 'owner'] as const;
export type CommunityRole = (typeof COMMUNITY_ROLES)[number];

/**
 * Grants are listed per role and not inherited implicitly.
 *
 * Spelling out `member`'s permissions inside `creator` is more lines and far
 * easier to audit: reading one row tells you everything that role can do,
 * without following a chain.
 */
const MEMBER_PERMISSIONS: readonly Permission[] = [
  'profile:edit',
  'account:delete',
  'comment:create',
  'comment:edit_own',
  'comment:delete_own',
  'reaction:create',
  'follow:create',
  'community:create',
  'community:join',
  'community:post',
  'content:report',
  'order:place',
];

const CREATOR_PERMISSIONS: readonly Permission[] = [
  ...MEMBER_PERMISSIONS,
  'video:publish',
  'video:edit_own',
  'video:delete_own',
  'short:publish',
  'store:create',
  'product:manage',
];

const MODERATOR_PERMISSIONS: readonly Permission[] = [
  ...CREATOR_PERMISSIONS,
  'moderation:review',
  'moderation:remove_content',
  'moderation:mute',
  'moderation:ban',
];

const PLATFORM_GRANTS: Record<PlatformRole, readonly Permission[]> = {
  // Signed out. Reading is not a permission - it is guarded by content
  // visibility, not by RBAC - so a visitor grants nothing at all.
  visitor: [],
  member: MEMBER_PERMISSIONS,
  creator: CREATOR_PERMISSIONS,
  moderator: MODERATOR_PERMISSIONS,
  admin: [...MODERATOR_PERMISSIONS, 'community:manage', 'channel:manage', 'platform:administer'],
};

const COMMUNITY_GRANTS: Record<CommunityRole, readonly Permission[]> = {
  guest: [],
  member: ['community:post', 'comment:create', 'reaction:create', 'content:report'],
  contributor: ['community:post', 'comment:create', 'reaction:create', 'content:report'],
  moderator: [
    'community:post',
    'comment:create',
    'reaction:create',
    'content:report',
    'moderation:review',
    'moderation:remove_content',
    'moderation:mute',
    'channel:manage',
  ],
  owner: [
    'community:post',
    'comment:create',
    'reaction:create',
    'content:report',
    'moderation:review',
    'moderation:remove_content',
    'moderation:mute',
    'moderation:ban',
    'community:manage',
    'channel:manage',
  ],
};

/**
 * Who is asking.
 *
 * Built on the server from the session, never from anything the client sent.
 */
export interface Actor {
  /** `null` when signed out. */
  readonly userId: string | null;
  readonly platformRoles: readonly PlatformRole[];
  /** Roles held per community. Populated from phase 5 onward. */
  readonly communityRoles?: Readonly<Record<string, readonly CommunityRole[]>>;
  /** A suspended account keeps its roles but loses every grant. */
  readonly suspended?: boolean;
}

export const ANONYMOUS: Actor = { userId: null, platformRoles: ['visitor'] };

export interface AuthorisationScope {
  /** Check community roles for this community in addition to platform roles. */
  readonly communityId?: string;
}

/**
 * The authorisation decision. Everything else in FLUX asks this function.
 */
export function can(actor: Actor, permission: Permission, scope: AuthorisationScope = {}): boolean {
  // Suspension is absolute, and is checked before anything can grant.
  if (actor.suspended) return false;

  for (const role of actor.platformRoles) {
    if (PLATFORM_GRANTS[role]?.includes(permission)) return true;
  }

  if (scope.communityId) {
    const roles = actor.communityRoles?.[scope.communityId] ?? [];
    for (const role of roles) {
      if (COMMUNITY_GRANTS[role]?.includes(permission)) return true;
    }
  }

  return false;
}

/** Everything this actor may do. Diagnostics and tests, not request paths. */
export function permissionsOf(actor: Actor, scope: AuthorisationScope = {}): Permission[] {
  return PERMISSIONS.filter((permission) => can(actor, permission, scope));
}

export function grantsForPlatformRole(role: PlatformRole): readonly Permission[] {
  return PLATFORM_GRANTS[role];
}

export function grantsForCommunityRole(role: CommunityRole): readonly Permission[] {
  return COMMUNITY_GRANTS[role];
}
