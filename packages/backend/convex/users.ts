import { ConvexError, v } from 'convex/values'
import { internalMutation, internalQuery, query } from './_generated/server'
import { authMutation, authQuery } from './util'

import {
  getAll,
  getOneFrom,
  getManyFrom,
  getManyVia
} from 'convex-helpers/server/relationships'

export const getUser = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId)
    return user
  }
})

export const getUserByTokenId = internalQuery({
  args: { tokenId: v.string() },
  handler: async (ctx, args) => {
    const user = await getOneFrom(ctx.db, 'users', 'tokenId', args.tokenId)

    return user
  }
})

export const createUser = internalMutation({
  args: {
    email: v.string(),
    tokenId: v.string(),
    name: v.string()
  },
  handler: async (ctx, args) => {
    const existingUser = await getOneFrom(
      ctx.db,
      'users',
      'tokenId',
      args.tokenId
    )

    if (existingUser) return existingUser

    const newUser = await ctx.db.insert('users', {
      email: args.email,
      tokenId: args.tokenId,
      isAdmin: false,
      name: args.name
    })
  }
})

export const updateUser = internalMutation({
  args: { userId: v.string(), name: v.string(), profileImage: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .first()

    if (!user) {
      throw new ConvexError('user not found')
    }

    await ctx.db.patch(user._id, {
      name: args.name,
      profileImage: args.profileImage
    })
  }
})

export const updateSubscription = internalMutation({
  args: {
    subscriptionId: v.string(),
    userId: v.id('users'),
    endsOn: v.number()
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .first()

    if (!user) {
      throw new Error('no user found with that user id')
    }

    await ctx.db.patch(user._id, {
      subscriptionId: args.subscriptionId,
      endsOn: args.endsOn
    })
  }
})

export const updateSubscriptionBySubId = internalMutation({
  args: { subscriptionId: v.string(), endsOn: v.number() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_subscriptionId', (q) =>
        q.eq('subscriptionId', args.subscriptionId)
      )
      .first()

    if (!user) {
      throw new Error('no user found with that user id')
    }

    await ctx.db.patch(user._id, {
      endsOn: args.endsOn
    })
  }
})

export const getMyUser = authQuery({
  args: {},
  async handler(ctx, args) {
    return ctx.user
  }
})

export const updateMyUser = authMutation({
  args: { name: v.string() },
  async handler(ctx, args) {
    await ctx.db.patch(ctx.user._id, {
      name: args.name
    })
  }
})
