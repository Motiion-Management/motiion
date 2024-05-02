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

export const { read, paginate } = crud(Users, query, mutation)

export const { create, update, destroy } = crud(
  Users,
  internalQuery,
  internalMutation
)

type UserDoc = Doc<'users'>

export const getMyUser = authQuery({
  args: {},
  async handler(ctx, args) {
    return ctx.user
  }
})

export const updateMyUser = authMutation({
  args: Users.withoutSystemFields,
  async handler(ctx, args) {
    await ctx.db.patch(ctx.user._id, args)
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
  phone: Users.withoutSystemFields.phone
})

export const updateUserByTokenId = internalAction({
  args: {
    tokenId: Users.withoutSystemFields.tokenId,
    patch: clerkFields
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getUserByTokenId, args)

    if (!user) {
      throw new ConvexError('user not found')
    }

    await ctx.runMutation(internal.users.update, {
      id: user._id,
      patch: args.patch
    })
  }
})
