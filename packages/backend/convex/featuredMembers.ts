import { query, mutation } from './_generated/server'
import { authMutation, authQuery, notEmpty } from './util'
import { zCrud, zQuery, zid } from '@packages/zodvex'
import { FeaturedMembers } from './schemas/featuredMembers'
import { getAll } from 'convex-helpers/server/relationships'
import { z } from 'zod'
import { UserDoc } from './schemas/users'

export const { read } = zCrud(FeaturedMembers, query, mutation)

export const { create, update, destroy } = zCrud(
  FeaturedMembers,
  authQuery,
  authMutation
)

const zFeaturedUser = z.object({
  userId: zid('users'),
  label: z.string(),
  headshotUrl: z.string()
})

export const getFeaturedChoreographers = zQuery(
  query,
  {},
  async (ctx) => {
    const result = await ctx.db.query('featuredMembers').first()
    const users = await getAll(ctx.db, result?.choreographers || [])

    if (users.length === 0) {
      return
    }
    return Promise.all(
      users.filter(notEmpty).map(async (user) => {
        const headshots = user.headshots?.filter(notEmpty) || []
        return {
          userId: user._id,
          label: user.displayName || user.fullName || '',
          headshotUrl: headshots[0]
            ? (await ctx.storage.getUrl(headshots[0].storageId)) || ''
            : ''
        }
      })
    )
  },
  { returns: z.array(zFeaturedUser).optional() }
)

export const getFeaturedTalent = zQuery(
  query,
  {},
  async (ctx) => {
    const result = await ctx.db.query('featuredMembers').first()
    const users = await getAll(ctx.db, result?.talent || [])

    if (users.length === 0) {
      return
    }
    return Promise.all(
      users.filter(notEmpty).map(async (user) => {
        const headshots = user.headshots?.filter(notEmpty) || []
        return {
          userId: user._id,
          label: user.displayName || user.fullName || '',
          headshotUrl: headshots[0]
            ? (await ctx.storage.getUrl(headshots[0].storageId)) || ''
            : ''
        }
      })
    )
  },
  { returns: z.array(zFeaturedUser).optional() }
)
