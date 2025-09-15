import { v, ConvexError } from 'convex/values'
import { paginationOptsValidator } from 'convex/server'
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
import { zodToConvex } from '@packages/zodvex'
import { attributesPlainObject } from './validators/attributes'
import { literals } from 'convex-helpers/validators'
import { zMutation } from '@packages/zodvex'
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

export const getMyUser = authQuery({
  args: {},
  async handler(ctx) {
    console.log('🔍 CONVEX_GET_USER: Query called', {
      userId: ctx.user?._id,
      hasUser: !!ctx.user,
      timestamp: new Date().toISOString()
    })
    return ctx.user
  }
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

export const updateMySizingField = authMutation({
  args: {
    section: v.string(),
    field: v.string(),
    value: v.string()
  },
  async handler(ctx, { section, field, value }): Promise<void> {
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
})

// Patch only specific fields inside `attributes`, merging with existing
export const patchUserAttributes = authMutation({
  args: {
    attributes: zodToConvex(z.object(attributesPlainObject).partial())
  },
  async handler(ctx, { attributes }): Promise<void> {
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
})

// clerk webhook functions
export const getUserByTokenId = internalQuery({
  args: { tokenId: Users.withoutSystemFields.tokenId },
  handler: async (ctx, args): Promise<UserDoc | null> => {
    const user = await getOneFrom(ctx.db, 'users', 'tokenId', args.tokenId)

    return user
  }
})

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

export const updateOrCreateUserByTokenId = internalMutation({
  args: {
    data: v.object({
      tokenId: v.string(),
      email: v.optional(v.string()),
      firstName: v.optional(v.string()),
      lastName: v.optional(v.string()),
      phone: v.optional(v.string())
    }),
    eventType: literals('user.created', 'user.updated')
  },
  handler: async (ctx, { data, eventType }) => {
    console.log('🔄 CONVEX_USER_SYNC: Starting user sync', {
      tokenId: data.tokenId,
      eventType,
      timestamp: new Date().toISOString()
    })

    // Validate and coerce incoming data using Zod
    const ClerkData = z.object({
      tokenId: z.string(),
      email: z.string().optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      phone: z.string().optional()
    })
    const parsed = ClerkData.parse(data)

    // In mutation context, look up via db
    const user = await ctx.db
      .query('users')
      .withIndex('tokenId', (q) => q.eq('tokenId', parsed.tokenId))
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
})

export const deleteUserByTokenId = internalMutation({
  args: { tokenId: Users.withoutSystemFields.tokenId },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('tokenId', (q) => q.eq('tokenId', args.tokenId))
      .unique()
    if (!user) {
      throw new ConvexError('user not found')
    }
    await ctx.db.delete(user._id)
  }
})

export const search = query({
  args: {
    query: v.string()
  },
  handler: async (ctx, { query }) => {
    const results = await ctx.db
      .query('users')
      .withSearchIndex('search_user', (q) => q.search('searchPattern', query))
      .take(10)

    const fullResults = await Promise.all(
      results.map(async (result) => {
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
})

export const updateDerivedPatterns = internalMutation({
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
  args: {
    userId: v.id('users')
  },
  handler: async (ctx, { userId }) => {
    const existing = ctx.user.favoriteUsers || []
    await ctx.db.patch(ctx.user._id, {
      favoriteUsers: existing.concat(userId)
    })
  }
})

export const removeFavoriteUser = authMutation({
  args: {
    userId: v.id('users')
  },
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
  handler: async (ctx) => {
    const users = await getAll(ctx.db, ctx.user?.favoriteUsers || [])

    if (users.length === 0) {
      return
    }
    return Promise.all(
      users.filter(notEmpty).map(async (user) => {
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

export const paginateProfiles = query({
  args: { paginationOpts: paginationOptsValidator },
  async handler(ctx, args) {
    const results = await filter(
      ctx.db.query('users'),
      async (user) => user.onboardingCompleted === true
    ).paginate(args.paginationOpts)

    return {
      ...results,
      page: await Promise.all(
        results.page.map(async (user) => {
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
  args: {
    userId: v.id('users')
  },
  handler: async (ctx, { userId }) => {
    return ctx.user && (ctx.user.favoriteUsers || []).includes(userId)
  }
})

export const saveMyPushToken = authMutation({
  args: {
    token: v.string(),
    platform: v.union(v.literal('ios'), v.literal('android'))
  },
  async handler(ctx, { token, platform }) {
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
})
