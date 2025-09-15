import { v, ConvexError } from 'convex/values'
// import { paginationOptsValidator } from 'convex/server'
import { filter } from 'convex-helpers/server/filter'
import {
  internalQuery,
  query,
  mutation,
  internalMutation
} from './_generated/server'
import { authMutation, authQuery, notEmpty } from './util'

import { getAll, getOneFrom } from 'convex-helpers/server/relationships'
import { crud } from 'convex-helpers/server'
import { UserDoc, Users, zUsers } from './validators/users'
import { z } from 'zod'
import { zodToConvex, zQuery, zMutation, zInternalQuery, zInternalMutation } from '@packages/zodvex'
import { attributesPlainObject } from './validators/attributes'
import { literals } from 'convex-helpers/validators'
import { zid } from 'convex-helpers/server/zodV4'
import { NEW_USER_DEFAULTS, formatFullName } from './users/helpers'
import { AgencyDoc } from './agencies'

export const { read } = crud(Users, query, mutation)

export const {
  create,
  update: internalUpdate,
  destroy
} = crud(Users, internalQuery, internalMutation)

export const { update } = crud(Users, authQuery, authMutation)

async function computeDerived(
  ctx: { db: { get: (id: any) => Promise<any> } },
  user: any
) {
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

export const getMyUser = zQuery(authQuery, {}, async (ctx) => {
  console.log('🔍 CONVEX_GET_USER: Query called', {
    userId: ctx.user?._id,
    hasUser: !!ctx.user,
    timestamp: new Date().toISOString()
  })
  return ctx.user
})

// Zod-validated mutation using convex-helpers + codecs
// Use existing authMutation (from util.ts) to supply ctx.user, and zMutation for Zod args parsing
export const updateMyUser = zMutation(
  authMutation,
  zUsers.partial(),
  async (ctx, args) => {
    const nextUser = { ...ctx.user, ...args }
    const derived = await computeDerived(ctx, nextUser)
    await ctx.db.patch(ctx.user._id, { ...args, ...derived })
  }
)

export const updateMySizingField = zMutation(
  authMutation,
  { section: z.string(), field: z.string(), value: z.string() },
  async (ctx, { section, field, value }): Promise<void> => {
    // Get current sizing data
    const currentSizing: Record<string, unknown> = ctx.user.sizing || {}
    const currentSection: Record<string, unknown> =
      (currentSizing as any)[section] || {}

    // Merge the new field value with existing section data
    const updatedSection = {
      ...currentSection,
      [field]: value
    }

    const nextUser = {
      ...ctx.user,
      sizing: {
        ...currentSizing,
        [section]: updatedSection
      }
    }
    const derived = await computeDerived(ctx, nextUser)
    // Update the user with merged sizing data and derived fields
    await ctx.db.patch(ctx.user._id, {
      sizing: nextUser.sizing,
      ...derived
    })
  }
)

// Patch only specific fields inside `attributes`, merging with existing
export const patchUserAttributes = zMutation(
  authMutation,
  { attributes: z.object(attributesPlainObject).partial() },
  async (ctx, { attributes }): Promise<void> => {
    const currentAttributes = (ctx.user.attributes || {}) as Record<
      string,
      unknown
    >
    const mergedAttributes = {
      ...currentAttributes,
      ...attributes
    } as any

    const nextUser = { ...ctx.user, attributes: mergedAttributes }
    const derived = await computeDerived(ctx, nextUser)
    await ctx.db.patch(ctx.user._id, {
      attributes: mergedAttributes,
      ...derived
    })
  }
)

// clerk webhook functions
export const getUserByTokenId = zInternalQuery(
  internalQuery,
  { tokenId: z.string() },
  async (ctx, { tokenId }): Promise<UserDoc | null> => {
    return await ctx.db
      .query('users')
      .withIndex('tokenId', (q: any) => q.eq('tokenId', tokenId))
      .first()
  }
)

// Minimal-typing variant to use from actions without heavy generics
export const getByTokenId = internalQuery({
  args: { tokenId: v.string() },
  handler: async (ctx, { tokenId }) => {
    return await ctx.db
      .query('users')
      .withIndex('tokenId', (q) => q.eq('tokenId', tokenId))
      .unique()
  }
})

// Deferred afterUpdate removed; derived fields computed inline above

export const updateOrCreateUserByTokenId = zInternalMutation(
  internalMutation,
  {
    data: z.object({
      tokenId: z.string(),
      email: z.string().optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      phone: z.string().optional()
    }),
    eventType: z.enum(['user.created', 'user.updated'])
  },
  async (ctx, { data, eventType }) => {
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
      await ctx.db.insert('users', { ...NEW_USER_DEFAULTS, ...userData })
    }

    console.log('✅ CONVEX_USER_SYNC: User sync completed', {
      tokenId: data.tokenId,
      eventType,
      timestamp: new Date().toISOString()
    })
  }
)

export const deleteUserByTokenId = zInternalMutation(
  internalMutation,
  { tokenId: z.string() },
  async (ctx, { tokenId }) => {
    const user = await ctx.db
      .query('users')
      .withIndex('tokenId', (q: any) => q.eq('tokenId', tokenId))
      .unique()
    if (!user) throw new ConvexError('user not found')
    await ctx.db.delete(user._id)
  }
)

export const search = zQuery(
  query,
  { query: z.string() },
  async (ctx, { query }) => {
    const results = await ctx.db
      .query('users')
      .withSearchIndex('search_user', (q: any) => q.search('searchPattern', query))
      .take(10)

    const fullResults = await Promise.all(
      results.map(async (result: any) => {
        let headshot
        let representationName
        if (result.representation?.agencyId) {
          const representation = await ctx.db.get(
            result.representation.agencyId
          )
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
)

export const updateDerivedPatterns = zInternalMutation(
  internalMutation,
  {},
  async (ctx) => {
    const users = await ctx.db.query('users').take(1000)
    for (const user of users) {
      const derived = await computeDerived(ctx, user)
      await ctx.db.patch(user._id, derived)
    }
  }
)

export const addFavoriteUser = zMutation(
  authMutation,
  { userId: zid('users') },
  async (ctx, { userId }) => {
    const existing = ctx.user.favoriteUsers || []
    await ctx.db.patch(ctx.user._id, {
      favoriteUsers: existing.concat(userId)
    })
  }
)

export const removeFavoriteUser = zMutation(
  authMutation,
  { userId: zid('users') },
  async (ctx, { userId }) => {
    const existing = ctx.user.favoriteUsers || []
    await ctx.db.patch(ctx.user._id, {
      favoriteUsers: existing.filter(
        (id: import('./_generated/dataModel').Id<'users'>) => id !== userId
      )
    })
  }
)

export const getFavoriteUsersForCarousel = zQuery(
  authQuery,
  {},
  async (ctx) => {
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
)

export const paginateProfiles = zQuery(
  query,
  { paginationOpts: z.any() },
  async (ctx, args) => {
    const results = await filter(
      ctx.db.query('users'),
      async (user) => user.onboardingCompleted === true
    ).paginate(args.paginationOpts)

    return {
      ...results,
      page: await Promise.all(
        results.page.map(async (user: any) => {
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
)

export const isFavoriteUser = zQuery(
  authQuery,
  { userId: zid('users') },
  async (ctx, { userId }) => {
    return ctx.user && (ctx.user.favoriteUsers || []).includes(userId)
  }
)

export const saveMyPushToken = zMutation(
  authMutation,
  { token: z.string(), platform: z.enum(['ios', 'android']) },
  async (ctx, { token, platform }) => {
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
  }
)
