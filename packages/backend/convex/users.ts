import { v, ConvexError } from 'convex/values'
import {
  internalQuery,
  query,
  mutation,
  internalMutation,
  internalAction
} from './_generated/server'
import { authMutation, authQuery } from './util'

import { getOneFrom } from 'convex-helpers/server/relationships'
import { crud } from 'convex-helpers/server'
import { UserDoc, Users, clerkCreateUserFields } from './validators/users'
import { internal } from './_generated/api'
import { literals, partial } from 'convex-helpers/validators'
import { NEW_USER_DEFAULTS, formatFullName } from './users/helpers'
import { AgencyDoc } from './agencies'

export const { paginate, read } = crud(Users, query, mutation)

export const {
  create,
  update: internalUpdate,
  destroy
} = crud(Users, internalQuery, internalMutation)

export const { update } = crud(Users, authQuery, authMutation)

export const getMyUser = authQuery({
  args: {},
  async handler(ctx) {
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
    const user = await ctx.runQuery(internal.users.getUserByTokenId, {
      tokenId: data.tokenId
    })

    const userData = {
      ...data,
      fullName: formatFullName(data.firstName, data.lastName)
    }

    if (user) {
      if (eventType === 'user.created') {
        console.warn('overwriting user', data.tokenId, 'with', data)
      } else
        await ctx.runMutation(internal.users.internalUpdate, {
          id: user._id,
          patch: userData
        })
    } else {
      await ctx.runMutation(internal.users.create, {
        ...NEW_USER_DEFAULTS,
        ...userData
      })
    }
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
