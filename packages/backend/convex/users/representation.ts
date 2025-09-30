import { authMutation } from '../util'
import { z } from 'zod'
import { zid } from '@packages/zodvex'
import { getActiveProfileTarget } from './profileHelpers'

export const addMyRepresentation = authMutation({
  args: { agencyId: zid('agencies') },
  handler: async (ctx, { agencyId }) => {
    const { targetId, profile } = await getActiveProfileTarget(ctx.db, ctx.user)
    const currentRep = profile?.representation || ctx.user.representation

    const updatedRep = {
      ...currentRep,
      agencyId
    }

    await ctx.db.patch(targetId, {
      representation: updatedRep
    })
  }
})

export const removeMyRepresentation = authMutation({
  handler: async (ctx) => {
    const { targetId, profile } = await getActiveProfileTarget(ctx.db, ctx.user)
    const currentRep = profile?.representation || ctx.user.representation

    const updatedRep = {
      ...currentRep,
      agencyId: undefined
    }

    await ctx.db.patch(targetId, {
      representation: updatedRep
    })
  }
})

export const setDisplayRep = authMutation({
  args: { displayRep: z.boolean() },
  handler: async (ctx, { displayRep }) => {
    const { targetId, profile } = await getActiveProfileTarget(ctx.db, ctx.user)
    const currentRep = profile?.representation || ctx.user.representation

    const updatedRep = {
      ...currentRep,
      displayRep
    }

    await ctx.db.patch(targetId, {
      representation: updatedRep
    })
  }
})

export const dismissRepresentationTip = authMutation({
  handler: async (ctx) => {
    const { targetId, profile } = await getActiveProfileTarget(ctx.db, ctx.user)
    const currentRep = profile?.representation || ctx.user.representation

    const updatedRep = {
      ...currentRep,
      tipDismissed: true
    }

    await ctx.db.patch(targetId, {
      representation: updatedRep
    })
  }
})
