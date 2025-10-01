import { ConvexError } from 'convex/values'
import { paginationOptsValidator } from 'convex/server'
import { filter } from 'convex-helpers/server/filter'
import { authMutation, authQuery, notEmpty, zq, zm, ziq, zim, zid } from './util'

import { getAll } from 'convex-helpers/server/relationships'
import { UserDoc, Users, zUsers } from './schemas/users'
import { z } from 'zod'
import { attributesPlainObject } from './schemas/attributes'
import { NEW_USER_DEFAULTS, formatFullName } from './users/helpers'
import { AgencyDoc } from './agencies'

const zUserDoc = Users.zDoc

// Public read
export const read = zq({
  args: { id: zid('users') },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id)
  }
})

// Public paginate
export const paginate = zq({
  args: { paginationOpts: paginationOptsValidator },
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
  let agency: AgencyDoc | null = null
  if (user.representation?.agencyId) {
    agency = await ctx.db.get(user.representation.agencyId)
  }
  const fullName = formatFullName(user.firstName, user.lastName)
  const searchPattern = `${fullName} ${user.displayName || ''} ${
    user.location?.city || ''
  } ${user.location?.state || ''} ${agency?.name || ''}`.trim()
  return { fullName, searchPattern }
}

// Return value schemas
const zUserDocOrNull = Users.zDoc.nullable()

export const getMyUser = authQuery({
  args: {},
  returns: zUserDocOrNull,
  handler: async (ctx) => {
    console.log('🔍 CONVEX_GET_USER: Query called', {
      userId: ctx.user?._id,
      hasUser: !!ctx.user,
      timestamp: new Date().toISOString()
    })

    if (!ctx.user) return null

    // AUTO-MIGRATE: If user has profileType but no active profile, migrate them
    if (
      ctx.user.profileType &&
      !ctx.user.activeDancerId &&
      !ctx.user.activeChoreographerId
    ) {
      console.log('🔄 AUTO-MIGRATION: User needs profile migration', {
        userId: ctx.user._id,
        profileType: ctx.user.profileType
      })

      // This is a query, so we can't mutate directly
      // Return user as-is but log for monitoring
      // The autoMigrateAndCleanup script will handle the actual migration
    }

    // If user has an active profile, merge the profile data for backward compatibility
    if (
      ctx.user.activeProfileType &&
      (ctx.user.activeDancerId || ctx.user.activeChoreographerId)
    ) {
      let profile = null

      if (ctx.user.activeProfileType === 'dancer' && ctx.user.activeDancerId) {
        profile = await ctx.db.get(ctx.user.activeDancerId)
      } else if (
        ctx.user.activeProfileType === 'choreographer' &&
        ctx.user.activeChoreographerId
      ) {
        profile = await ctx.db.get(ctx.user.activeChoreographerId)
      }

      if (profile) {
        // Merge profile data back into user for backward compatibility
        // Profile data takes precedence over user data
        const mergedUser: any = {
          ...ctx.user,
          // Profile fields that might differ
          headshots: profile.headshots || ctx.user.headshots,
          attributes: profile.attributes || ctx.user.attributes,
          sizing: profile.sizing || ctx.user.sizing,
          resume: profile.resume || ctx.user.resume,
          links: profile.links || ctx.user.links,
          representation: profile.representation || ctx.user.representation,
          representationStatus:
            profile.representationStatus || ctx.user.representationStatus,
          profileTipDismissed:
            profile.profileTipDismissed || ctx.user.profileTipDismissed,
          // Dancer-specific
          ...(ctx.user.activeProfileType === 'dancer'
            ? {
                sagAftraId: profile.sagAftraId || ctx.user.sagAftraId,
                training: profile.training || ctx.user.training,
                workLocation: profile.workLocation || ctx.user.workLocation,
                location: profile.location || ctx.user.location
              }
            : {}),
          // Choreographer-specific
          ...(ctx.user.activeProfileType === 'choreographer'
            ? {
                companyName: profile.companyName || ctx.user.companyName,
                workLocation: profile.workLocation || ctx.user.workLocation,
                location: profile.location || ctx.user.location,
                databaseUse: profile.databaseUse || ctx.user.databaseUse
              }
            : {})
        }

        return mergedUser
      }
    }

    return ctx.user
  }
})

// Zod-validated mutation using convex-helpers + codecs
// Use existing authMutation (from util.ts) to supply ctx.user
// ACCOUNT-LEVEL ONLY: For profile data, use dancer/choreographer mutations
export const updateMyUser = authMutation({
  args: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    displayName: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    dateOfBirth: z.string().optional(),
    profileType: z.enum(['dancer', 'choreographer', 'guest']).optional(),
    onboardingCompleted: z.boolean().optional(),
    onboardingCompletedAt: z.string().optional(),
    onboardingVersion: z.string().optional(),
    currentOnboardingStep: z.string().optional(),
    currentOnboardingStepIndex: z.number().optional()
  }),
  returns: z.null(),
  handler: async (ctx, args) => {
    // Only update account-level fields
    const nextUser = {
      firstName: args.firstName ?? ctx.user.firstName,
      lastName: args.lastName ?? ctx.user.lastName,
      displayName: args.displayName ?? ctx.user.displayName
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

export const search = zq({
  args: { query: z.string() },
  handler: async (ctx, { query }) => {
    const results = await ctx.db
      .query('users')
      .withSearchIndex('search_user', (q) => q.search('searchPattern', query))
      .take(10)

    const fullResults = await Promise.all(
      results.map(async (result: any) => {
        let headshot
        let representationName
        if (result.representation?.agencyId) {
          const representation = (await ctx.db.get(
            result.representation.agencyId
          )) as AgencyDoc | null
          representationName = representation?.shortName || representation?.name
        }

        if (result.headshots?.[0]) {
          headshot = {
            url: await ctx.storage.getUrl(result.headshots[0].storageId),
            ...result.headshots[0]
          }
        }

        return {
          ...result,
          representationName,
          headshot
        }
      })
    )

    return fullResults
  }
})

export const updateDerivedPatterns = zim({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query('users').take(1000)
    for (const user of users) {
      const derived = await computeDerived(ctx, user)
      await ctx.db.patch(user._id, derived)
    }
  }
})

export const addFavoriteUser = authMutation({
  args: { userId: zid('users') },
  handler: async (ctx, { userId }) => {
    const existing = ctx.user.favoriteUsers || []
    await ctx.db.patch(ctx.user._id, {
      favoriteUsers: existing.concat(userId)
    })
  }
})

export const removeFavoriteUser = authMutation({
  args: { userId: zid('users') },
  handler: async (ctx, { userId }) => {
    const existing = ctx.user.favoriteUsers || []
    await ctx.db.patch(ctx.user._id, {
      favoriteUsers: existing.filter(
        (id: import('./_generated/dataModel').Id<'users'>) => id !== userId
      )
    })
  }
})

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
    const users = await getAll(ctx.db, ctx.user?.favoriteUsers || [])

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
    const results = await (
      filter(
        ctx.db.query('users') as any,
        async (user: any) => user.onboardingCompleted === true
      ) as any
    ).paginate(args.paginationOpts)

    return {
      ...results,
      page: await Promise.all(
        results.page.map(async (user: UserDoc) => {
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
  }
})

export const isFavoriteUser = authQuery({
  args: { userId: zid('users') },
  returns: z.boolean(),
  handler: async (ctx, { userId }) => {
    return !!(ctx.user && (ctx.user.favoriteUsers || []).includes(userId))
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
