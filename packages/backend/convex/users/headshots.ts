import { query, MutationCtx } from '../_generated/server'
import { authMutation, authQuery } from '../util'
import { ConvexError } from 'convex/values'
import { Id } from '../_generated/dataModel'
import { zQuery, zMutation } from '@packages/zodvex'
import { z } from 'zod'
import { zid } from 'convex-helpers/server/zodV4'
import { zFileUploadObjectArray } from '../validators/base'

export const getMyHeadshots = zQuery(
  authQuery,
  {},
  async (ctx) => {
    if (!ctx.user?.headshots) {
      return []
    }

    type Headshot = { storageId: Id<'_storage'>; title?: string; uploadDate: string; position?: number }
    return Promise.all(
      ctx.user.headshots.map(async (headshot: Headshot) => ({
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

    const headshots = args.headshots

    if (ctx.user.headshots?.length === 5) {
      throw new ConvexError(
        'You already have 5 headshots. Please remove one before adding another.'
      )
    }

    // Merge new headshots in front of existing, then cap at 5 and normalize positions
    const merged = ctx.user.headshots
      ? [...args.headshots, ...ctx.user.headshots]
      : args.headshots
    const limited = await ensureOnlyFive(ctx, merged)
    type Headshot = { storageId: Id<'_storage'>; title?: string; uploadDate: string; position?: number }
    const normalized = (limited as Headshot[]).map((h: Headshot, idx: number) => ({ ...h, position: idx }))
    ctx.db.patch(ctx.user._id, {
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

    type Headshot = { storageId: Id<'_storage'>; title?: string; uploadDate: string; position?: number }
    const filtered = (ctx.user.headshots || []).filter(
      (h: Headshot) => h.storageId !== args.headshotId
    )
    const normalized = (filtered as Headshot[]).map((h: Headshot, idx: number) => ({ ...h, position: idx }))
    await ctx.db.patch(ctx.user._id, { headshots: normalized })
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

    const current = ctx.user.headshots || []

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

    await ctx.db.patch(ctx.user._id, { headshots: next })
  }
)
