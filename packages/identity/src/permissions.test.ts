import { describe, expect, it } from 'vitest';

import {
  ANONYMOUS,
  type Actor,
  PERMISSIONS,
  PLATFORM_ROLES,
  can,
  grantsForPlatformRole,
  isPermission,
  permissionsOf,
} from './permissions';

const member: Actor = { userId: 'u1', platformRoles: ['member'] };
const creator: Actor = { userId: 'u2', platformRoles: ['creator'] };
const moderator: Actor = { userId: 'u3', platformRoles: ['moderator'] };
const admin: Actor = { userId: 'u4', platformRoles: ['admin'] };

describe('deny by default', () => {
  it('grants a signed-out visitor nothing', () => {
    expect(permissionsOf(ANONYMOUS)).toEqual([]);
    expect(can(ANONYMOUS, 'comment:create')).toBe(false);
    expect(can(ANONYMOUS, 'video:publish')).toBe(false);
  });

  it('denies an actor with no roles at all', () => {
    expect(can({ userId: 'u9', platformRoles: [] }, 'profile:edit')).toBe(false);
  });

  it('denies a permission the actor was never granted', () => {
    expect(can(member, 'moderation:ban')).toBe(false);
    expect(can(member, 'platform:administer')).toBe(false);
    expect(can(creator, 'moderation:remove_content')).toBe(false);
  });

  it('denies an unrecognised permission rather than letting it through', () => {
    // The cast is the point: this is what a typo or a stale client sends.
    expect(can(admin, 'video:teleport' as never)).toBe(false);
    expect(isPermission('video:teleport')).toBe(false);
  });
});

describe('suspension', () => {
  it('removes every grant, whatever the roles say', () => {
    const suspendedAdmin: Actor = { ...admin, suspended: true };
    expect(can(suspendedAdmin, 'platform:administer')).toBe(false);
    expect(can(suspendedAdmin, 'profile:edit')).toBe(false);
    expect(permissionsOf(suspendedAdmin)).toEqual([]);
  });
});

describe('platform roles', () => {
  it('lets a member take part but not publish or moderate', () => {
    expect(can(member, 'comment:create')).toBe(true);
    expect(can(member, 'community:create')).toBe(true);
    expect(can(member, 'video:publish')).toBe(false);
    expect(can(member, 'moderation:mute')).toBe(false);
  });

  it('lets a creator publish', () => {
    expect(can(creator, 'video:publish')).toBe(true);
    expect(can(creator, 'short:publish')).toBe(true);
    expect(can(creator, 'store:create')).toBe(true);
  });

  it('lets a moderator act on content', () => {
    expect(can(moderator, 'moderation:remove_content')).toBe(true);
    expect(can(moderator, 'moderation:ban')).toBe(true);
    // Moderation is not administration.
    expect(can(moderator, 'platform:administer')).toBe(false);
  });

  it('gives each role at least everything the one below it has', () => {
    const ladder = ['member', 'creator', 'moderator', 'admin'] as const;
    for (let index = 1; index < ladder.length; index++) {
      const lower = grantsForPlatformRole(ladder[index - 1]!);
      const higher = grantsForPlatformRole(ladder[index]!);
      for (const permission of lower) {
        expect(higher, `${ladder[index]} should include ${permission}`).toContain(permission);
      }
    }
  });
});

describe('community roles', () => {
  const communityId = 'c1';
  const communityMod: Actor = {
    userId: 'u5',
    platformRoles: ['member'],
    communityRoles: { [communityId]: ['moderator'] },
  };

  it('applies only inside the community that granted them', () => {
    expect(can(communityMod, 'moderation:remove_content', { communityId })).toBe(true);
    expect(can(communityMod, 'moderation:remove_content', { communityId: 'other' })).toBe(false);
    // …and never platform-wide.
    expect(can(communityMod, 'moderation:remove_content')).toBe(false);
  });

  it('does not grant platform administration to a community owner', () => {
    const owner: Actor = {
      userId: 'u6',
      platformRoles: ['member'],
      communityRoles: { [communityId]: ['owner'] },
    };
    expect(can(owner, 'community:manage', { communityId })).toBe(true);
    expect(can(owner, 'platform:administer', { communityId })).toBe(false);
  });
});

describe('the permission table itself', () => {
  it('lists every permission exactly once', () => {
    expect(new Set(PERMISSIONS).size).toBe(PERMISSIONS.length);
  });

  it('grants nothing that is not a declared permission', () => {
    for (const role of PLATFORM_ROLES) {
      for (const permission of grantsForPlatformRole(role)) {
        expect(PERMISSIONS).toContain(permission);
      }
    }
  });

  it('has an owner for every permission, so none is unreachable', () => {
    const granted = new Set(PLATFORM_ROLES.flatMap((role) => [...grantsForPlatformRole(role)]));
    const orphans = PERMISSIONS.filter((permission) => !granted.has(permission));
    expect(orphans, 'permissions no platform role can ever hold').toEqual([]);
  });
});
