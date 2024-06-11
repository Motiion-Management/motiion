import { authMutation } from '../util'
import { v } from 'convex/values'

export const addMyRepresentation = authMutation({
  args: {
    representation: v.id('agencies')
  },
  handler: async (ctx, { representation }) => {
    await ctx.db.patch(ctx.user._id, {
      representation: {
        ...ctx.user.representation,
        agencyId: representation
      }
    })
  }
})

export const removeMyRepresentation = authMutation({
  args: {},
  handler: async (ctx) => {
    await ctx.db.patch(ctx.user._id, {
      representation: {
        ...ctx.user.representation,
        agencyId: undefined
      }
    })
  }
})

export const setDisplayRep = authMutation({
  args: {
    displayRep: v.boolean()
  },
  handler: async (ctx, { displayRep }) => {
    await ctx.db.patch(ctx.user._id, {
      representation: {
        ...ctx.user.representation,
        displayRep
      }
    })
  }
})

export const dismissRepresentationTip = authMutation({
  args: {},
  handler: async (ctx) => {
    await ctx.db.patch(ctx.user._id, {
      representation: {
        ...ctx.user.representation,
        tipDismissed: true
      }
    })
  }
})
