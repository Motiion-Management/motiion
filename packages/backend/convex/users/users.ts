import { ConvexError } from 'convex/values'
// Convex exposes a pagination validator in convex/values, but zCustomQuery expects Zod.
// Define a Zod equivalent for args typing here.
import { z } from 'zod'
import {
  authMutation,
  authQuery,
  notEmpty,
  zq,
  zm,
  ziq,
  zim,
  zid
} from '../util'

import { getAll } from 'convex-helpers/server/relationships'
import { UserDoc, Users, zUsers } from '../schemas/users'
import { zPaginated } from 'zodvex'
import { NEW_USER_DEFAULTS, formatFullName } from './helpers'

// Public read
export const read = zq({
  args: { id: zid('users') },
  returns: Users.zDoc.nullable(),
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id)
  }
})

// Public paginate
const zPaginationOpts = z.object({
  numItems: z.number(),
  cursor: z.string().nullable()
})
export const paginate = zq({
  args: { paginationOpts: zPaginationOpts },
  returns: zPaginated(Users.zDoc),
  handler: async (ctx, { paginationOpts }) => {
    return await ctx.db.query('users').paginate(paginationOpts)
  }
})

// Internal create
export const create = zim({
  args: zUsers,
  returns: zid('users'),
  handler: async (ctx, args) => {
    return await ctx.db.insert('users', args)
  }
})

// Internal update
export const internalUpdate = zim({
  args: {
    id: zid('users'),
    patch: z.any()
  },
  returns: z.null(),
  handler: async (ctx, { id, patch }) => {
    await ctx.db.patch(id, patch)
    return null
  }
})

// Internal destroy
export const destroy = zim({
  args: { id: zid('users') },
  returns: z.null(),
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id)
    return null
  }
})

async function computeDerived(
  ctx: { db: { get: (id: any) => Promise<any> } },
  user: Partial<UserDoc>
): Promise<{ fullName: string; searchPattern: string }> {
  // This function is deprecated - searchPattern should come from profiles now
  const fullName = formatFullName(user.firstName, user.lastName)
  const searchPattern = fullName.trim()
  return { fullName, searchPattern }
}

// Return value schemas
// const zUserDocOrNull = Users.zDoc.nullable()

export const getMyUser = authQuery({
  args: {},
  // returns: zUserDocOrNull,
  handler: async (ctx) => {
    console.log('🔍 CONVEX_GET_USER: Query called', {
      userId: ctx.user?._id,
      hasUser: !!ctx.user,
      timestamp: new Date().toISOString()
    })

    if (!ctx.user) return null

    // Migration complete - all users should have active profiles now
    // Profile data is accessed separately via profile queries
    return ctx.user
  }
})

// Zod-validated mutation using convex-helpers + codecs
// ACCOUNT-LEVEL ONLY: For profile data, use dancer/choreographer mutations
//
// IMPORTANT: Profile-specific fields (headshots, attributes, sizing, resume, etc.)
// should be updated using:
// - dancers.updateMyDancerProfile() for dancers
// - choreographers.updateMyChoreographerProfile() for choreographers
export const updateMyUser = authMutation({
  args: z.object({
    // Account-level fields only
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    dateOfBirth: z.string().optional()
  }),
  returns: z.null(),
  handler: async (ctx, args) => {
    // Compute derived fields for account-level data
    const nextUser = {
      firstName: args.firstName ?? ctx.user.firstName,
      lastName: args.lastName ?? ctx.user.lastName
    }
    const derived = await computeDerived(ctx, nextUser)

    await ctx.db.patch(ctx.user._id, { ...args, ...derived })

    return null
  }
})

// REMOVED: updateMySizingField - moved to dancers.ts
// REMOVED: patchUserAttributes - moved to dancers.ts
// Profile data should be updated via dancer/choreographer specific mutations

// clerk webhook functions
export const getUserByTokenId = ziq({
  args: { tokenId: z.string() },
  handler: async (ctx, { tokenId }) => {
    return await ctx.db
      .query('users')
      .withIndex('tokenId', (q) => q.eq('tokenId', tokenId))
      .first()
  }
})

// Minimal-typing variant to use from actions without heavy generics
export const getByTokenId = ziq({
  args: { tokenId: z.string() },
  handler: async (ctx, { tokenId }) => {
    const user = await ctx.db
      .query('users')
      .withIndex('tokenId', (q) => q.eq('tokenId', tokenId))
      .unique()
    return user
  }
})

// Deferred afterUpdate removed; derived fields computed inline above

export const updateOrCreateUserByTokenId = zim({
  args: {
    data: z.object({
      tokenId: z.string(),
      email: z.string().optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      phone: z.string().optional()
    }),
    eventType: z.enum(['user.created', 'user.updated'])
  },
  handler: async (ctx, { data, eventType }) => {
    console.log('🔄 CONVEX_USER_SYNC: Starting user sync', {
      tokenId: data.tokenId,
      eventType,
      timestamp: new Date().toISOString()
    })

    const parsed = data

    // In mutation context, look up via db
    const user = await ctx.db
      .query('users')
      .withIndex('tokenId', (q: any) => q.eq('tokenId', parsed.tokenId))
      .unique()

    const userData = {
      ...parsed,
      fullName: formatFullName(parsed.firstName, parsed.lastName)
    }

    if (user) {
      if (eventType === 'user.created') {
        console.warn(
          '🚨 CONVEX_USER_SYNC: Overwriting existing user',
          data.tokenId,
          'with',
          data
        )
      } else {
        console.log('📝 CONVEX_USER_SYNC: Updating existing user', data.tokenId)
        await ctx.db.patch(user._id, userData)
      }
    } else {
      console.log('✨ CONVEX_USER_SYNC: Creating new user', data.tokenId)
      if (!parsed.email) {
        throw new Error('Email is required when creating a new user')
      }
      await ctx.db.insert('users', {
        ...NEW_USER_DEFAULTS,
        ...userData,
        email: parsed.email
      })
    }

    console.log('✅ CONVEX_USER_SYNC: User sync completed', {
      tokenId: data.tokenId,
      eventType,
      timestamp: new Date().toISOString()
    })
  }
})

// Public query: Check if user exists by Clerk tokenId
// No authentication required - used during signup to wait for webhook
export const userExistsByTokenId = zq({
  args: { tokenId: z.string() },
  returns: z.boolean(),
  handler: async (ctx, { tokenId }) => {
    const user = await ctx.db
      .query('users')
      .withIndex('tokenId', (q) => q.eq('tokenId', tokenId))
      .unique()
    return user !== null
  }
})

export const deleteUserByTokenId = zim({
  args: { tokenId: z.string() },
  handler: async (ctx, { tokenId }) => {
    const user = await ctx.db
      .query('users')
      .withIndex('tokenId', (q) => q.eq('tokenId', tokenId))
      .unique()
    if (!user) throw new ConvexError('user not found')
    await ctx.db.delete(user._id)
  }
})

// DEPRECATED: User search removed - use dancers.searchDancers() or choreographers.searchChoreographers() instead
export const search = zq({
  args: { query: z.string() },
  handler: async (ctx, { query }) => {
    // Migration complete: Search moved to profile-specific functions
    // Use dancers.searchDancers() or choreographers.searchChoreographers()
    return []
  }
})

// DEPRECATED: updateDerivedPatterns removed - searchPattern now managed per-profile
export const updateDerivedPatterns = zim({
  args: {},
  handler: async (ctx) => {
    // No-op: searchPattern is now managed in dancer/choreographer profiles
  }
})

// DEPRECATED: Use addFavoriteDancer / addFavoriteChoreographer from dancers.ts instead
// This mutation converts userId to profileId for backward compatibility
export const addFavoriteUser = authMutation({
  args: { userId: zid('users') },
  handler: async (ctx, { userId }) => {
    if (!ctx.user.activeDancerId && !ctx.user.activeChoreographerId) {
      throw new ConvexError('No active profile found')
    }

    // Get the favorite user to determine their profile type
    const favoriteUser = await ctx.db.get(userId)
    if (!favoriteUser) {
      throw new ConvexError('User not found')
    }

    const myProfileId =
      ctx.user.activeDancerId || ctx.user.activeChoreographerId
    if (!myProfileId) {
      throw new ConvexError('No active profile')
    }

    const myProfile = await ctx.db.get(myProfileId)
    if (!myProfile) {
      throw new ConvexError('Profile not found')
    }

    // Add to appropriate favorites array based on favorite user's profile type
    if (favoriteUser.activeDancerId) {
      const existing = (myProfile as any).favoriteDancers || []
      if (!existing.includes(favoriteUser.activeDancerId)) {
        await ctx.db.patch(myProfileId, {
          favoriteDancers: [...existing, favoriteUser.activeDancerId]
        })
      }
    }
    if (favoriteUser.activeChoreographerId) {
      const existing = (myProfile as any).favoriteChoreographers || []
      if (!existing.includes(favoriteUser.activeChoreographerId)) {
        await ctx.db.patch(myProfileId, {
          favoriteChoreographers: [
            ...existing,
            favoriteUser.activeChoreographerId
          ]
        })
      }
    }
  }
})

// DEPRECATED: Use removeFavoriteDancer / removeFavoriteChoreographer from dancers.ts instead
export const removeFavoriteUser = authMutation({
  args: { userId: zid('users') },
  handler: async (ctx, { userId }) => {
    if (!ctx.user.activeDancerId && !ctx.user.activeChoreographerId) {
      throw new ConvexError('No active profile found')
    }

    // Get the favorite user to determine their profile type
    const favoriteUser = await ctx.db.get(userId)
    if (!favoriteUser) {
      throw new ConvexError('User not found')
    }

    const myProfileId =
      ctx.user.activeDancerId || ctx.user.activeChoreographerId
    if (!myProfileId) {
      throw new ConvexError('No active profile')
    }

    const myProfile = await ctx.db.get(myProfileId)
    if (!myProfile) {
      throw new ConvexError('Profile not found')
    }

    // Remove from appropriate favorites arrays
    if (favoriteUser.activeDancerId) {
      const existing = (myProfile as any).favoriteDancers || []
      await ctx.db.patch(myProfileId, {
        favoriteDancers: existing.filter(
          (id: any) => id !== favoriteUser.activeDancerId
        )
      })
    }
    if (favoriteUser.activeChoreographerId) {
      const existing = (myProfile as any).favoriteChoreographers || []
      await ctx.db.patch(myProfileId, {
        favoriteChoreographers: existing.filter(
          (id: any) => id !== favoriteUser.activeChoreographerId
        )
      })
    }
  }
})

// Get favorites from user's active profile (dancer or choreographer)
// Returns users associated with favorite dancer and choreographer profiles
export const getFavoriteUsersForCarousel = authQuery({
  args: {},
  returns: z
    .array(
      z.object({
        userId: z.string(),
        label: z.string(),
        headshotUrl: z.string()
      })
    )
    .optional(),
  handler: async (ctx) => {
    // Get favorites from active profile
    let favoriteUserIds: any[] = []

    if (ctx.user?.activeDancerId || ctx.user?.activeChoreographerId) {
      const profileId =
        ctx.user.activeDancerId || ctx.user.activeChoreographerId
      if (profileId) {
        const profile = await ctx.db.get(profileId)
        if (profile) {
          // Collect all favorite profile IDs (both dancers and choreographers)
          const favoriteDancers = (profile as any).favoriteDancers || []
          const favoriteChoreographers =
            (profile as any).favoriteChoreographers || []

          // Get the user IDs for these profiles
          const allProfileIds = [...favoriteDancers, ...favoriteChoreographers]
          for (const profileId of allProfileIds) {
            const prof = await ctx.db.get(profileId)
            if (prof && (prof as any).userId) {
              favoriteUserIds.push((prof as any).userId)
            }
          }
        }
      }
    }

    const users = await getAll(ctx.db, favoriteUserIds)

    if (users.length === 0) {
      return
    }
    return Promise.all(
      users.filter(notEmpty).map(async (user: any) => {
        const headshots = user.headshots?.filter(notEmpty) || []
        return {
          userId: user._id,
          label: user.displayName || user.fullName || '',
          headshotUrl: headshots[0]
            ? (await ctx.storage.getUrl(headshots[0].storageId)) || ''
            : ''
        }
      })
    )
  }
})

// DEPRECATED: Use dancers.searchDancers() or choreographers.searchChoreographers() instead
// This function queried user fields that have been migrated to profile tables
export const paginateProfiles = zq({
  args: {
    paginationOpts: z.object({
      numItems: z.number(),
      cursor: z.string().nullable()
    })
  },
  returns: z.object({
    page: z.array(
      z.object({
        userId: z.string(),
        label: z.string(),
        headshotUrl: z.string()
      })
    ),
    isDone: z.boolean(),
    continueCursor: z.string()
  }),
  handler: async (ctx, args) => {
    // Return empty results - this function is deprecated after profile migration
    return {
      page: [],
      isDone: true,
      continueCursor: ''
    }
  }
})

export const isFavoriteUser = authQuery({
  args: { userId: zid('users') },
  returns: z.boolean(),
  handler: async (ctx, { userId }) => {
    if (!ctx.user) return false

    // Check favorites from active profile
    const profileId = ctx.user.activeDancerId || ctx.user.activeChoreographerId
    if (!profileId) return false

    const profile = await ctx.db.get(profileId)
    if (!profile) return false

    // Get all favorite profile IDs
    const favoriteDancers = (profile as any).favoriteDancers || []
    const favoriteChoreographers = (profile as any).favoriteChoreographers || []
    const allFavoriteProfileIds = [
      ...favoriteDancers,
      ...favoriteChoreographers
    ]

    // Check if any favorite profile belongs to this user
    for (const favProfileId of allFavoriteProfileIds) {
      const favProfile = await ctx.db.get(favProfileId)
      if (favProfile && (favProfile as any).userId === userId) {
        return true
      }
    }

    return false
  }
})

export const saveMyPushToken = authMutation({
  args: { token: z.string(), platform: z.enum(['ios', 'android']) },
  returns: z.null(),
  handler: async (ctx, { token, platform }) => {
    const existing = ctx.user.pushTokens || []
    // Remove duplicates of the same token
    const filtered = existing.filter(
      (t: { token: string; platform: 'ios' | 'android'; updatedAt: number }) =>
        t.token !== token
    )
    // Optionally keep only the latest per platform (dedupe by platform)
    const withoutPlatform = filtered.filter(
      (t: { token: string; platform: 'ios' | 'android'; updatedAt: number }) =>
        t.platform !== platform
    )

    const updated = [
      ...withoutPlatform,
      { token, platform, updatedAt: Date.now() }
    ]

    // Use the generated UserDoc type to derive the push token type
    type PushToken = NonNullable<UserDoc['pushTokens']>[number]
    const typed = updated as PushToken[]
    await ctx.db.patch(ctx.user._id, { pushTokens: typed })
    return null
  }
})
