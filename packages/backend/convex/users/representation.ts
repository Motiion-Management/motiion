import { authMutation } from '../util'
import { zMutation } from '@packages/zodvex'
import { z } from 'zod'
import { zid } from 'convex-helpers/server/zodV4'

export const addMyRepresentation = zMutation(
  authMutation,
  { agencyId: zid('agencies') },
  async (ctx, { agencyId }) => {
    // Get current representation from profile or user
    let currentRep = ctx.user.representation
    let profile = null

    if (ctx.user.activeProfileType && (ctx.user.activeDancerId || ctx.user.activeChoreographerId)) {
      if (ctx.user.activeProfileType === 'dancer' && ctx.user.activeDancerId) {
        profile = await ctx.db.get(ctx.user.activeDancerId)
      } else if (ctx.user.activeProfileType === 'choreographer' && ctx.user.activeChoreographerId) {
        profile = await ctx.db.get(ctx.user.activeChoreographerId)
      }

      if (profile?.representation) {
        currentRep = profile.representation
      }
    }

    const updatedRep = {
      ...currentRep,
      agencyId
    }

    // DUAL-WRITE: Update both user and profile
    await ctx.db.patch(ctx.user._id, {
      representation: updatedRep
    })

    if (profile) {
      await ctx.db.patch(profile._id, {
        representation: updatedRep
      })
    }
  }
)

export const removeMyRepresentation = zMutation(
  authMutation,
  {},
  async (ctx) => {
    // Get current representation from profile or user
    let currentRep = ctx.user.representation
    let profile = null

    if (ctx.user.activeProfileType && (ctx.user.activeDancerId || ctx.user.activeChoreographerId)) {
      if (ctx.user.activeProfileType === 'dancer' && ctx.user.activeDancerId) {
        profile = await ctx.db.get(ctx.user.activeDancerId)
      } else if (ctx.user.activeProfileType === 'choreographer' && ctx.user.activeChoreographerId) {
        profile = await ctx.db.get(ctx.user.activeChoreographerId)
      }

      if (profile?.representation) {
        currentRep = profile.representation
      }
    }

    const updatedRep = {
      ...currentRep,
      agencyId: undefined
    }

    // DUAL-WRITE: Update both user and profile
    await ctx.db.patch(ctx.user._id, {
      representation: updatedRep
    })

    if (profile) {
      await ctx.db.patch(profile._id, {
        representation: updatedRep
      })
    }
  }
)

export const setDisplayRep = zMutation(
  authMutation,
  { displayRep: z.boolean() },
  async (ctx, { displayRep }) => {
    // Get current representation from profile or user
    let currentRep = ctx.user.representation
    let profile = null

    if (ctx.user.activeProfileType && (ctx.user.activeDancerId || ctx.user.activeChoreographerId)) {
      if (ctx.user.activeProfileType === 'dancer' && ctx.user.activeDancerId) {
        profile = await ctx.db.get(ctx.user.activeDancerId)
      } else if (ctx.user.activeProfileType === 'choreographer' && ctx.user.activeChoreographerId) {
        profile = await ctx.db.get(ctx.user.activeChoreographerId)
      }

      if (profile?.representation) {
        currentRep = profile.representation
      }
    }

    const updatedRep = {
      ...currentRep,
      displayRep
    }

    // DUAL-WRITE: Update both user and profile
    await ctx.db.patch(ctx.user._id, {
      representation: updatedRep
    })

    if (profile) {
      await ctx.db.patch(profile._id, {
        representation: updatedRep
      })
    }
  }
)

export const dismissRepresentationTip = zMutation(
  authMutation,
  {},
  async (ctx) => {
    // Get current representation from profile or user
    let currentRep = ctx.user.representation
    let profile = null

    if (ctx.user.activeProfileType && (ctx.user.activeDancerId || ctx.user.activeChoreographerId)) {
      if (ctx.user.activeProfileType === 'dancer' && ctx.user.activeDancerId) {
        profile = await ctx.db.get(ctx.user.activeDancerId)
      } else if (ctx.user.activeProfileType === 'choreographer' && ctx.user.activeChoreographerId) {
        profile = await ctx.db.get(ctx.user.activeChoreographerId)
      }

      if (profile?.representation) {
        currentRep = profile.representation
      }
    }

    const updatedRep = {
      ...currentRep,
      tipDismissed: true
    }

    // DUAL-WRITE: Update both user and profile
    await ctx.db.patch(ctx.user._id, {
      representation: updatedRep
    })

    if (profile) {
      await ctx.db.patch(profile._id, {
        representation: updatedRep
      })
    }
  }
)
