import { authMutation, notEmpty, zq, zodDoc } from './util'
import { zid } from '@packages/zodvex'
import { FeaturedMembers, featuredMembers } from './schemas/featuredMembers'
import { getAll } from 'convex-helpers/server/relationships'
import { z } from 'zod'
import { UserDoc } from './schemas/users'

const zFeaturedMembersDoc = zodDoc('featuredMembers', featuredMembers)

// Public read
export const read = zq({
  args: { id: zid('featuredMembers') },
  returns: zFeaturedMembersDoc.nullable(),
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id)
  }
})

// Authenticated create
export const create = authMutation({
  args: z.object(featuredMembers),
  returns: zid('featuredMembers'),
  handler: async (ctx, args) => {
    return await ctx.db.insert('featuredMembers', args)
  }
})

// Authenticated update
export const update = authMutation({
  args: z.object({
    id: zid('featuredMembers'),
    patch: z.object(featuredMembers).partial()
  }),
  returns: z.null(),
  handler: async (ctx, { id, patch }) => {
    await ctx.db.patch(id, patch)
    return null
  }
})

// Authenticated destroy
export const destroy = authMutation({
  args: { id: zid('featuredMembers') },
  returns: z.null(),
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id)
    return null
  }
})

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
