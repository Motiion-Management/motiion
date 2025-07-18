import { query, mutation } from './_generated/server'
import { authMutation, authQuery, notEmpty } from './util'

import { crud } from 'convex-helpers/server'
import { FeaturedMembers } from './validators/featuredMembers'
import { getAll } from 'convex-helpers/server/relationships'
import type { RegisteredQuery } from 'convex/server'

export const { read } = crud(FeaturedMembers, query, mutation)

export const { create, update, destroy } = crud(
  FeaturedMembers,
  authQuery,
  authMutation
)

export const getFeaturedChoreographers = query({
  args: {},
  handler: async (ctx) => {
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
  }
})

export const getFeaturedTalent: RegisteredQuery<'public', Record<string, never>, Array<{
  userId: string;
  label: string;
  headshotUrl: string;
}> | undefined> = query({
  async handler(ctx) {
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
  }
})
