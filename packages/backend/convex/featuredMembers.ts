import { query, mutation } from './_generated/server'
import { authMutation, authQuery, notEmpty, zq } from './util'
import { zid } from '@packages/zodvex'
import { FeaturedMembers } from './schemas/featuredMembers'
import { getAll } from 'convex-helpers/server/relationships'
import { crud } from 'convex-helpers/server/crud'
import schema from './schema'
import { z } from 'zod'
import { UserDoc } from './schemas/users'

export const { read } = crud(schema, 'featuredmembers', query, mutation)

export const { create, update, destroy } = crud(
  FeaturedMembers,
  authQuery,
  authMutation
)

const zFeaturedUser = z.object({
  userId: zid('users'),
  label: z.string(),
  headshotUrl: z.string()
})

export const getFeaturedChoreographers = zq({
  returns: z.array(zFeaturedUser).optional(),
  handler: async (ctx) => {
    const result = await ctx.db.query('featuredMembers').first()
    const users = await getAll(ctx.db as any, result?.choreographers || [])

    if (users.length === 0) {
      return
    }
    return Promise.all(
      users.filter(notEmpty).map(async (user) => {
        const headshots: any = Array.isArray(user.headshots) ? user.headshots.filter(notEmpty) : []
        return {
          userId: user._id,
          label: user.displayName || user.fullName || '',
          headshotUrl: headshots[0]
            ? (await ctx.storage.getUrl(headshots[0].storageId)) || ''
            : ''
        }
      })
    ) as any
  }
})

export const getFeaturedTalent = zq({
  returns: z.array(zFeaturedUser).optional(),
  handler: async (ctx) => {
    const result = await ctx.db.query('featuredMembers').first()
    const users = await getAll(ctx.db as any, result?.talent || [])

    if (users.length === 0) {
      return
    }
    return Promise.all(
      users.filter(notEmpty).map(async (user) => {
        const headshots: any = Array.isArray(user.headshots) ? user.headshots.filter(notEmpty) : []
        return {
          userId: user._id,
          label: user.displayName || user.fullName || '',
          headshotUrl: headshots[0]
            ? (await ctx.storage.getUrl(headshots[0].storageId)) || ''
            : ''
        }
      })
    ) as any
  }
})
