import { ConvexError, v } from 'convex/values'
import { internalMutation, internalQuery, query } from './_generated/server'
import { authMutation, authQuery } from './util'

import {
  getAll,
  getOneFrom,
  getManyFrom,
  getManyVia
} from 'convex-helpers/server/relationships'

export const getMember = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const member = await getOneFrom(ctx.db, 'members', 'userId', args.userId)

    return member
  }
})
