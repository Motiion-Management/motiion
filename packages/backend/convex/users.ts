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
import { literals } from 'convex-helpers/validators'

export const { paginate, read } = crud(Users, query, mutation)

export const { create, update, destroy } = crud(
  Users,
  internalQuery,
  internalMutation
)

export const { update: updateMyUser } = crud(Users, authQuery, authMutation)

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
        await ctx.runMutation(internal.users.update, {
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
