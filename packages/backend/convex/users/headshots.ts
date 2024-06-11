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

    if (ctx.user.headshots) {
      headshots.unshift(...ctx.user.headshots)
    }

    ctx.db.patch(ctx.user._id, {
      headshots: await ensureOnlyFive(ctx, headshots)
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

    const headshots = (ctx.user.headshots || []).filter(
      (h) => h.storageId !== args.headshotId
    )

    await ctx.db.patch(ctx.user._id, { headshots })
  }
})
