import { query, MutationCtx } from '../_generated/server'
import { authMutation, authQuery, zq } from '../util'
import { ConvexError } from 'convex/values'
import { Id } from '../_generated/dataModel'
import { z } from 'zod'
import { zid } from '@packages/zodvex'
import { zFileUploadObjectArray } from '../schemas/base'

export const getMyHeadshots = authQuery({
  returns: z.array(
    z.object({
      url: z.union([z.string(), z.null()]),
      storageId: zid('_storage'),
      title: z.string().optional(),
      uploadDate: z.string(),
      position: z.number().optional()
    })
  ),
  handler: async (ctx) => {
    // PROFILE-FIRST: Check active profile first, then fall back to user
    let headshots = ctx.user?.headshots || []

    if (ctx.user?.activeProfileType && (ctx.user?.activeDancerId || ctx.user?.activeChoreographerId)) {
      let profile = null

      if (ctx.user.activeProfileType === 'dancer' && ctx.user.activeDancerId) {
        profile = await ctx.db.get(ctx.user.activeDancerId)
      } else if (ctx.user.activeProfileType === 'choreographer' && ctx.user.activeChoreographerId) {
        profile = await ctx.db.get(ctx.user.activeChoreographerId)
      }

      if (profile?.headshots && Array.isArray(profile.headshots)) {
        headshots = profile.headshots as any
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
})

export const getHeadshots = zq({
  args: { userId: zid('users') },
  returns: z.array(
    z.object({
      url: z.union([z.string(), z.null()]),
      storageId: zid('_storage'),
      title: z.string().optional(),
      uploadDate: z.string(),
      position: z.number().optional()
    })
  ),
  handler: async (ctx, args) => {
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
})

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

export const saveHeadshotIds = authMutation({
  args: { headshots: zFileUploadObjectArray },
  handler: async (ctx, args) => {
    if (!ctx.user) return

    // Determine where to save headshots
    let targetId: any = ctx.user._id
    let currentHeadshots: any = ctx.user.headshots || []

    if (ctx.user.activeProfileType && (ctx.user.activeDancerId || ctx.user.activeChoreographerId)) {
      if (ctx.user.activeProfileType === 'dancer' && ctx.user.activeDancerId) {
        const profile = await ctx.db.get(ctx.user.activeDancerId)
        if (profile) {
          targetId = ctx.user.activeDancerId
          currentHeadshots = Array.isArray(profile.headshots) ? profile.headshots : []
        }
      } else if (ctx.user.activeProfileType === 'choreographer' && ctx.user.activeChoreographerId) {
        const profile = await ctx.db.get(ctx.user.activeChoreographerId)
        if (profile) {
          targetId = ctx.user.activeChoreographerId
          currentHeadshots = Array.isArray(profile.headshots) ? profile.headshots : []
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
})

export const removeHeadshot = authMutation({
  args: { headshotId: zid('_storage') },
  handler: async (ctx, args) => {
    if (!ctx.user) {
      return
    }

    await ctx.storage.delete(args.headshotId)

    // Determine where to remove from
    let targetId: any = ctx.user._id
    let currentHeadshots: any = ctx.user.headshots || []

    if (ctx.user.activeProfileType && (ctx.user.activeDancerId || ctx.user.activeChoreographerId)) {
      if (ctx.user.activeProfileType === 'dancer' && ctx.user.activeDancerId) {
        const profile = await ctx.db.get(ctx.user.activeDancerId)
        if (profile) {
          targetId = ctx.user.activeDancerId
          currentHeadshots = Array.isArray(profile.headshots) ? profile.headshots : []
        }
      } else if (ctx.user.activeProfileType === 'choreographer' && ctx.user.activeChoreographerId) {
        const profile = await ctx.db.get(ctx.user.activeChoreographerId)
        if (profile) {
          targetId = ctx.user.activeChoreographerId
          currentHeadshots = Array.isArray(profile.headshots) ? profile.headshots : []
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
})

export const updateHeadshotPosition = authMutation({
  args: {
    headshots: z.array(
      z.object({
        storageId: zid('_storage'),
        position: z.number()
      })
    )
  },
  handler: async (ctx, { headshots }) => {
    if (!ctx.user) return

    // Determine where to update
    let targetId: any = ctx.user._id
    let current: any = ctx.user.headshots || []

    if (ctx.user.activeProfileType && (ctx.user.activeDancerId || ctx.user.activeChoreographerId)) {
      if (ctx.user.activeProfileType === 'dancer' && ctx.user.activeDancerId) {
        const profile = await ctx.db.get(ctx.user.activeDancerId)
        if (profile) {
          targetId = ctx.user.activeDancerId
          current = Array.isArray(profile.headshots) ? profile.headshots : []
        }
      } else if (ctx.user.activeProfileType === 'choreographer' && ctx.user.activeChoreographerId) {
        const profile = await ctx.db.get(ctx.user.activeChoreographerId)
        if (profile) {
          targetId = ctx.user.activeChoreographerId
          current = Array.isArray(profile.headshots) ? profile.headshots : []
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
})
