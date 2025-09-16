import { authMutation } from '../util'
import { zMutation } from '@packages/zodvex'
import { z } from 'zod'
import { zid } from 'convex-helpers/server/zodV4'

export const addMyRepresentation = zMutation(
  authMutation,
  { agencyId: zid('agencies') },
  async (ctx, { agencyId }) => {
    await ctx.db.patch(ctx.user._id, {
      representation: {
        ...ctx.user.representation,
        agencyId
      }
    })
  }
)

export const removeMyRepresentation = zMutation(
  authMutation,
  {},
  async (ctx) => {
    await ctx.db.patch(ctx.user._id, {
      representation: {
        ...ctx.user.representation,
        agencyId: undefined
      }
    })
  }
)

export const setDisplayRep = zMutation(
  authMutation,
  { displayRep: z.boolean() },
  async (ctx, { displayRep }) => {
    await ctx.db.patch(ctx.user._id, {
      representation: {
        ...ctx.user.representation,
        displayRep
      }
    })
  }
)

export const dismissRepresentationTip = zMutation(
  authMutation,
  {},
  async (ctx) => {
    await ctx.db.patch(ctx.user._id, {
      representation: {
        ...ctx.user.representation,
        tipDismissed: true
      }
    })
  }
)
