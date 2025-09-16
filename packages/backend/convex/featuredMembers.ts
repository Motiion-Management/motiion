import { query, mutation } from './_generated/server'
import { authMutation, authQuery, notEmpty } from './util'
import { zCrud, zQuery } from '@packages/zodvex'
import { FeaturedMembers } from './validators/featuredMembers'
import { getAll } from 'convex-helpers/server/relationships'

export const { read } = zCrud(FeaturedMembers, query, mutation)

export const { create, update, destroy } = zCrud(
  FeaturedMembers,
  authQuery,
  authMutation
)

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
      users.filter(notEmpty).map(async (user: any) => {
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
  }
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
      users.filter(notEmpty).map(async (user: any) => {
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
  }
)
