import { ConvexError, v } from 'convex/values'
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
import { Users } from './schema'
import { Doc } from './_generated/dataModel'
import { internal } from './_generated/api'
import { literals, partial } from 'convex-helpers/validators'

export const { paginate, read } = crud(Users, query, mutation)

export const {
  create,
  update: internalUpdate,
  destroy
} = crud(Users, internalQuery, internalMutation)

export const { update } = crud(Users, authQuery, authMutation)

export type UserDoc = Doc<'users'>

export const ONBOARDING_STEPS = {
  COMPLETE: 0,
  VISION: 1,
  PERSONAL_INFO: 2,
  HEADSHOTS: 3,
  RESUME: 4
} as const

export const NEW_USER_DEFAULTS = {
  type: 'member',
  isAdmin: false,
  pointsEarned: 0,
  onboardingStep: ONBOARDING_STEPS.VISION,
  profileTip: false,
  representationTip: false
} as const

export const getMyUser = authQuery({
  args: {},
  async handler(ctx) {
    return ctx.user
  }
})

export const updateMyUser = authMutation({
  args: partial(Users.withoutSystemFields),
  async handler(ctx, args) {
    await ctx.db.patch(ctx.user._id, {
      ...args
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

const clerkFields = v.object({
  email: Users.withoutSystemFields.email,
  firstName: Users.withoutSystemFields.firstName,
  lastName: Users.withoutSystemFields.lastName,
  phone: Users.withoutSystemFields.phone,
  tokenId: Users.withoutSystemFields.tokenId
})

export const updateOrCreateUserByTokenId = internalAction({
  args: {
    data: clerkFields,
    eventType: literals('user.created', 'user.updated')
  },
  handler: async (ctx, { data, eventType }) => {
    const user = await ctx.runQuery(internal.users.getUserByTokenId, {
      tokenId: data.tokenId
    })

    if (user) {
      if (eventType === 'user.created') {
        console.warn('overwriting user', data.tokenId, 'with', data)
      } else
        await ctx.runMutation(internal.users.internalUpdate, {
          id: user._id,
          patch: data
        })
    } else {
      await ctx.runMutation(internal.users.create, {
        ...NEW_USER_DEFAULTS,
        ...data
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

function onlyUnique(value: any, index: number, array: any[]) {
  return array.indexOf(value) === index
}

export const searchUsersByName = query({
  args: {
    query: v.string()
  },
  handler: async (ctx, { query }) => {
    console.log('searching for ', query)
    const fnResults = await ctx.db
      .query('users')
      .withSearchIndex('search_first_name_users', (q) =>
        q.search('firstName', query)
      )
      .take(10)

    const lnResults = await ctx.db
      .query('users')
      .withSearchIndex('search_last_name_users', (q) =>
        q.search('lastName', query)
      )
      .take(10)

    const results = [...fnResults, ...lnResults].filter(onlyUnique)

    const fullResults = await Promise.all(
      results.map(async (result) => {
        const resume = await getOneFrom(ctx.db, 'resumes', 'userId', result._id)
        let headshot
        if (resume?.headshots && resume.headshots.length > 0) {
          headshot = {
            url: await ctx.storage.getUrl(resume.headshots[0].storageId),
            ...resume.headshots[0]
          }
        }
        let representation = null
        let representationName = null
        if (resume?.representation) {
          representation = await ctx.db.get(resume.representation)
          // console.log('representation', representation)
          representationName = representation?.name
        }
        return {
          firstName: result.firstName,
          lastName: result.lastName,
          headshot: headshot?.url,
          representation: representationName
        }
      })
    )
    return fullResults
  }
})

export const searchLastNameUsers = query({
  args: {
    query: v.string()
  },
  handler: async (ctx, { query }) => {
    console.log('searching for ', query)
    const results = await ctx.db
      .query('users')
      .withSearchIndex('search_last_name_users', (q) =>
        q.search('lastName', query)
      )
      .take(10)

    const fullResults = await Promise.all(
      results.map(async (result) => {
        const resume = await getOneFrom(ctx.db, 'resumes', 'userId', result._id)
        let headshot = null
        if (resume?.headshots && resume.headshots.length > 0) {
          headshot = {
            url: await ctx.storage.getUrl(resume.headshots[0].storageId),
            ...resume.headshots[0]
          }
        }
        let representation = null
        let representationName = null
        if (resume?.representation) {
          representation = await ctx.db.get(resume.representation)
          console.log('representation', representation)
          representationName = representation?.name
        }
        return {
          firstName: result.firstName,
          lastName: result.lastName,
          headshot: headshot?.url,
          representation: representationName
        }
      })
    )
    return fullResults
  }
})
