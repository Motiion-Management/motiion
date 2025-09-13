import { v, ConvexError } from 'convex/values'
import { paginationOptsValidator } from 'convex/server'
import { filter } from 'convex-helpers/server/filter'
import {
  internalQuery,
  query,
  mutation,
  internalMutation,
  internalAction
} from './_generated/server'
import { authMutation, authQuery, notEmpty } from './util'

import { getAll, getOneFrom } from 'convex-helpers/server/relationships'
import { crud } from 'convex-helpers/server'
import { UserDoc, Users, clerkCreateUserFields } from './validators/users'
import { z } from 'zod'
import { zodToConvex } from 'convex-helpers/server/zodV4'
import { attributesPlainObject } from './validators/attributes'
import { internal } from './_generated/api'
import { literals, partial } from 'convex-helpers/validators'
import { NEW_USER_DEFAULTS, formatFullName } from './users/helpers'
import { AgencyDoc } from './agencies'

export const { read } = crud(Users, query, mutation)

export const {
  create,
  update: internalUpdate,
  destroy
} = crud(Users, internalQuery, internalMutation)

export const { update } = crud(Users, authQuery, authMutation)

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

export const updateMyUser = authMutation({
  args: partial(Users.withoutSystemFields),
  async handler(ctx, args): Promise<void> {
    await ctx.db.patch(ctx.user._id, {
      ...args
    })

    const user = {
      ...ctx.user,
      ...args
    }

    await ctx.scheduler.runAfter(0, internal.users.afterUpdate, user)
  }
})

export const updateMySizingField = authMutation({
  args: {
    section: v.string(),
    field: v.string(),
    value: v.string()
  },
  async handler(ctx, { section, field, value }): Promise<void> {
    // Get current sizing data
    const currentSizing = ctx.user.sizing || {}
    const currentSection = (currentSizing as any)[section] || {}

    // Merge the new field value with existing section data
    const updatedSection = {
      ...currentSection,
      [field]: value
    }

    // Update the user with merged sizing data
    await ctx.db.patch(ctx.user._id, {
      sizing: {
        ...currentSizing,
        [section]: updatedSection
      } as any
    })

    // Trigger afterUpdate for any derived calculations
    const updatedUser = {
      ...ctx.user,
      sizing: {
        ...currentSizing,
        [section]: updatedSection
      } as any
    }
    await ctx.scheduler.runAfter(0, internal.users.afterUpdate, updatedUser)
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

    await ctx.db.patch(ctx.user._id, {
      attributes: mergedAttributes
    })

    const updatedUser = {
      ...ctx.user,
      attributes: mergedAttributes
    }

    await ctx.scheduler.runAfter(0, internal.users.afterUpdate, updatedUser)
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

export const afterUpdate = internalAction({
  args: Users.withSystemFields,
  handler: async (ctx, user): Promise<void> => {
    console.log('updating user', user._id, user.fullName, user.displayName)
    let agency: AgencyDoc | null = null
    if (user.representation?.agencyId) {
      agency = await ctx.runQuery(internal.agencies.internalRead, {
        id: user.representation?.agencyId
      })
    }

    const fullName = formatFullName(user.firstName, user.lastName)
    const searchPattern =
      `${fullName} ${user.displayName || ''} ${user.location?.city || ''} ${user.location?.state || ''} ${agency?.name || ''}`.trim()

    console.log({ fullName, searchPattern })

    await ctx.runMutation(internal.users.internalUpdate, {
      id: user._id,
      patch: {
        fullName,
        searchPattern
      }
    })
  }
})

export const updateOrCreateUserByTokenId = internalAction({
  args: {
    data: clerkCreateUserFields,
    eventType: literals('user.created', 'user.updated')
  },
  handler: async (ctx, { data, eventType }) => {
    console.log('🔄 CONVEX_USER_SYNC: Starting user sync', {
      tokenId: data.tokenId,
      eventType,
      timestamp: new Date().toISOString()
    })

    const user = await ctx.runQuery(internal.users.getUserByTokenId, {
      tokenId: data.tokenId
    })

    const userData = {
      ...data,
      fullName: formatFullName(data.firstName, data.lastName)
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
        await ctx.runMutation(internal.users.internalUpdate, {
          id: user._id,
          patch: userData
        })
      }
    } else {
      console.log('✨ CONVEX_USER_SYNC: Creating new user', data.tokenId)
      await ctx.runMutation(internal.users.create, {
        ...NEW_USER_DEFAULTS,
        ...userData
      })
    }

    console.log('✅ CONVEX_USER_SYNC: User sync completed', {
      tokenId: data.tokenId,
      eventType,
      timestamp: new Date().toISOString()
    })
  }
})

export const deleteUserByTokenId = internalAction({
  args: { tokenId: Users.withoutSystemFields.tokenId },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getUserByTokenId, args)

    if (!user) {
      throw new ConvexError('user not found')
    }

    await ctx.runMutation(internal.users.destroy, { id: user._id })
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

    users.forEach(async (user) => {
      ctx.scheduler.runAfter(0, internal.users.afterUpdate, user)
    })
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
      favoriteUsers: existing.filter((id) => id !== userId)
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
    const filtered = existing.filter((t) => t.token !== token)
    // Optionally keep only the latest per platform (dedupe by platform)
    const withoutPlatform = filtered.filter((t) => t.platform !== platform)

    const updated = [
      ...withoutPlatform,
      { token, platform, updatedAt: Date.now() }
    ]

    await ctx.db.patch(ctx.user._id, { pushTokens: updated as any })
  }
})
