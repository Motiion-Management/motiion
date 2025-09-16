import { authMutation } from '../util'
import { zMutation } from 'zodvex'
import { z } from 'zod'
import { zid } from 'convex-helpers/server/zodV4'
import { getActiveProfileTarget } from './profileHelpers'

export const addMyRepresentation = zMutation(
  authMutation,
  { agencyId: zid('agencies') },
  async (ctx, { agencyId }) => {
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
)

export const removeMyRepresentation = zMutation(
  authMutation,
  {},
  async (ctx) => {
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
)

export const setDisplayRep = zMutation(
  authMutation,
  { displayRep: z.boolean() },
  async (ctx, { displayRep }) => {
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
)

export const dismissRepresentationTip = zMutation(
  authMutation,
  {},
  async (ctx) => {
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
)
