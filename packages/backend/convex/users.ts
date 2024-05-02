import { v } from 'convex/values'
import { internalQuery, query, mutation } from './_generated/server'
import { authMutation, authQuery } from './util'

import { getOneFrom } from 'convex-helpers/server/relationships'
import { crud } from 'convex-helpers/server'
import { Users } from './schema'
import { Doc } from './_generated/dataModel'

export const { read, paginate } = crud(Users, query, mutation)

export const { create, update, destroy } = crud(Users, authQuery, authMutation)

type UserDoc = Doc<'users'>

export const getUserByTokenId = internalQuery({
  args: { tokenId: v.string() },
  handler: async (ctx, args): Promise<UserDoc | null> => {
    const user = await getOneFrom(ctx.db, 'users', 'tokenId', args.tokenId)

    return user
  }
})

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
