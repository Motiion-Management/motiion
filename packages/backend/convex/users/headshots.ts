import { query, MutationCtx } from '../_generated/server'
import { authMutation, authQuery } from '../util'
import { ConvexError, v } from 'convex/values'
import { Id } from '../_generated/dataModel'
import { zodToConvex } from 'convex-helpers/server/zod'
import { zFileUploadObjectArray } from '../validators/base'

export const getMyHeadshots = authQuery({
  args: {},
  handler: async (ctx) => {
    if (!ctx.user?.headshots) {
      return []
    }

    return Promise.all(
      ctx.user.headshots.map(async (headshot) => ({
        url: await ctx.storage.getUrl(headshot.storageId),
        ...headshot
      }))
    )
  }
})

export const getHeadshots = query({
  args: {
    userId: v.id('users')
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId)
    if (!user?.headshots) {
      return []
    }

    return Promise.all(
      user.headshots.map(async (headshot) => ({
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
  args: {
    headshots: zodToConvex(zFileUploadObjectArray) // other args...
  },
  handler: async (ctx, args) => {
    if (!ctx.user) return

    const headshots = args.headshots

    if (ctx.user.headshots?.length === 5) {
      throw new ConvexError(
        'You already have 5 headshots. Please remove one before adding another.'
      )
    }

    // Merge new headshots in front of existing, then cap at 5 and normalize positions
    const merged = ctx.user.headshots ? [...args.headshots, ...ctx.user.headshots] : args.headshots
    const limited = await ensureOnlyFive(ctx, merged)
    const normalized = limited.map((h, idx) => ({ ...h, position: idx }))
    ctx.db.patch(ctx.user._id, {
      headshots: normalized
    })
  }
})

export const removeHeadshot = authMutation({
  args: {
    headshotId: v.id('_storage')
  },
  handler: async (ctx, args) => {
    if (!ctx.user) {
      return
    }

    await ctx.storage.delete(args.headshotId)

    const filtered = (ctx.user.headshots || []).filter((h) => h.storageId !== args.headshotId)
    const normalized = filtered.map((h, idx) => ({ ...h, position: idx }))
    await ctx.db.patch(ctx.user._id, { headshots: normalized })
  }
})

export const updateHeadshotPosition = authMutation({
  args: {
    headshots: v.array(
      v.object({
        storageId: v.id('_storage'),
        position: v.number()
      })
    )
  },
  handler: async (ctx, { headshots }) => {
    if (!ctx.user) return

    const current = ctx.user.headshots || []

    // Map payload positions by storageId
    const posMap = new Map(headshots.map((h) => [h.storageId, h.position]))

    const inPayload = current
      .filter((h) => posMap.has(h.storageId))
      .sort((a, b) => (posMap.get(a.storageId)! - posMap.get(b.storageId)!))

    const remaining = current.filter((h) => !posMap.has(h.storageId))

    const next = [...inPayload, ...remaining].map((h, idx) => ({ ...h, position: idx }))

    await ctx.db.patch(ctx.user._id, { headshots: next })
  }
})
