import { query, MutationCtx } from '../_generated/server'
import { authMutation, authQuery } from '../util'
import { ConvexError } from 'convex/values'
import { Id } from '../_generated/dataModel'
import { zQuery, zMutation } from 'zodvex'
import { z } from 'zod'
import { zid } from 'zodvex'
import { zFileUploadObjectArray } from '../schemas/base'

export const getMyHeadshots = zQuery(
  authQuery,
  {},
  async (ctx) => {
    // PROFILE-FIRST: Check active profile first, then fall back to user
    let headshots = ctx.user?.headshots || []

    if (ctx.user?.activeProfileType && (ctx.user?.activeDancerId || ctx.user?.activeChoreographerId)) {
      let profile = null

      if (ctx.user.activeProfileType === 'dancer' && ctx.user.activeDancerId) {
        profile = await ctx.db.get(ctx.user.activeDancerId)
      } else if (ctx.user.activeProfileType === 'choreographer' && ctx.user.activeChoreographerId) {
        profile = await ctx.db.get(ctx.user.activeChoreographerId)
      }

      if (profile?.headshots) {
        headshots = profile.headshots
      }
    }

    if (!headshots || headshots.length === 0) {
      return []
    }

    type Headshot = { storageId: Id<'_storage'>; title?: string; uploadDate: string; position?: number }
    return Promise.all(
      headshots.map(async (headshot: Headshot) => ({
        url: await ctx.storage.getUrl(headshot.storageId),
        ...headshot
      }))
    )
  }
)

export const getHeadshots = zQuery(
  query,
  { userId: zid('users') },
  async (ctx, args) => {
    const user = await ctx.db.get(args.userId)
    if (!user?.headshots) {
      return []
    }

    type Headshot = { storageId: Id<'_storage'>; title?: string; uploadDate: string; position?: number }
    return Promise.all(
      user.headshots.map(async (headshot: Headshot) => ({
        url: await ctx.storage.getUrl(headshot.storageId),
        ...headshot
      }))
    )
  }
)

async function ensureOnlyFive(
  ctx: MutationCtx,
  files: { storageId: Id<'_storage'>; title?: string; uploadDate: string }[]
) {
  let current
  while (files.length > 5) {
    current = files.pop()
    console.log('deleting', current)
    await ctx.storage.delete(current!.storageId)
  }
  return files
}

export const saveHeadshotIds = zMutation(
  authMutation,
  { headshots: zFileUploadObjectArray },
  async (ctx, args) => {
    if (!ctx.user) return

    // Determine where to save headshots
    let targetId = ctx.user._id
    let currentHeadshots = ctx.user.headshots || []

    if (ctx.user.activeProfileType && (ctx.user.activeDancerId || ctx.user.activeChoreographerId)) {
      if (ctx.user.activeProfileType === 'dancer' && ctx.user.activeDancerId) {
        const profile = await ctx.db.get(ctx.user.activeDancerId)
        if (profile) {
          targetId = ctx.user.activeDancerId
          currentHeadshots = profile.headshots || []
        }
      } else if (ctx.user.activeProfileType === 'choreographer' && ctx.user.activeChoreographerId) {
        const profile = await ctx.db.get(ctx.user.activeChoreographerId)
        if (profile) {
          targetId = ctx.user.activeChoreographerId
          currentHeadshots = profile.headshots || []
        }
      }
    }

    if (currentHeadshots.length === 5) {
      throw new ConvexError(
        'You already have 5 headshots. Please remove one before adding another.'
      )
    }

    // Merge new headshots in front of existing, then cap at 5 and normalize positions
    const merged = currentHeadshots.length > 0
      ? [...args.headshots, ...currentHeadshots]
      : args.headshots
    const limited = await ensureOnlyFive(ctx, merged)
    type Headshot = { storageId: Id<'_storage'>; title?: string; uploadDate: string; position?: number }
    const normalized = (limited as Headshot[]).map((h: Headshot, idx: number) => ({ ...h, position: idx }))

    // Update only the target (profile or user)
    await ctx.db.patch(targetId, {
      headshots: normalized
    })
  }
)

export const removeHeadshot = zMutation(
  authMutation,
  { headshotId: zid('_storage') },
  async (ctx, args) => {
    if (!ctx.user) {
      return
    }

    await ctx.storage.delete(args.headshotId)

    // Determine where to remove from
    let targetId = ctx.user._id
    let currentHeadshots = ctx.user.headshots || []

    if (ctx.user.activeProfileType && (ctx.user.activeDancerId || ctx.user.activeChoreographerId)) {
      if (ctx.user.activeProfileType === 'dancer' && ctx.user.activeDancerId) {
        const profile = await ctx.db.get(ctx.user.activeDancerId)
        if (profile) {
          targetId = ctx.user.activeDancerId
          currentHeadshots = profile.headshots || []
        }
      } else if (ctx.user.activeProfileType === 'choreographer' && ctx.user.activeChoreographerId) {
        const profile = await ctx.db.get(ctx.user.activeChoreographerId)
        if (profile) {
          targetId = ctx.user.activeChoreographerId
          currentHeadshots = profile.headshots || []
        }
      }
    }

    type Headshot = { storageId: Id<'_storage'>; title?: string; uploadDate: string; position?: number }
    const filtered = currentHeadshots.filter(
      (h: Headshot) => h.storageId !== args.headshotId
    )
    const normalized = (filtered as Headshot[]).map((h: Headshot, idx: number) => ({ ...h, position: idx }))

    // Update only the target (profile or user)
    await ctx.db.patch(targetId, { headshots: normalized })
  }
)

export const updateHeadshotPosition = zMutation(
  authMutation,
  {
    headshots: z.array(
      z.object({
        storageId: zid('_storage'),
        position: z.number()
      })
    )
  },
  async (ctx, { headshots }) => {
    if (!ctx.user) return

    // Determine where to update
    let targetId = ctx.user._id
    let current = ctx.user.headshots || []

    if (ctx.user.activeProfileType && (ctx.user.activeDancerId || ctx.user.activeChoreographerId)) {
      if (ctx.user.activeProfileType === 'dancer' && ctx.user.activeDancerId) {
        const profile = await ctx.db.get(ctx.user.activeDancerId)
        if (profile) {
          targetId = ctx.user.activeDancerId
          current = profile.headshots || []
        }
      } else if (ctx.user.activeProfileType === 'choreographer' && ctx.user.activeChoreographerId) {
        const profile = await ctx.db.get(ctx.user.activeChoreographerId)
        if (profile) {
          targetId = ctx.user.activeChoreographerId
          current = profile.headshots || []
        }
      }
    }

    // Map payload positions by storageId
    const posMap = new Map(headshots.map((h: { storageId: Id<'_storage'>; position: number }) => [h.storageId, h.position]))

    type Headshot = { storageId: Id<'_storage'>; title?: string; uploadDate: string; position?: number }
    const inPayload = (current as Headshot[])
      .filter((h: Headshot) => posMap.has(h.storageId))
      .sort((a: Headshot, b: Headshot) => posMap.get(a.storageId)! - posMap.get(b.storageId)!)

    const remaining = (current as Headshot[]).filter((h: Headshot) => !posMap.has(h.storageId))

    const next = [...inPayload, ...remaining].map((h: Headshot, idx: number) => ({
      ...h,
      position: idx
    }))

    // Update only the target (profile or user)
    await ctx.db.patch(targetId, { headshots: next })
  }
)
