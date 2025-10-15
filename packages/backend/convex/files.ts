import { zodToConvex } from 'zodvex'
import { internalAction } from './_generated/server'
import { authMutation, authQuery, zid } from './util'
import { zFileUploadObjectArray } from './schemas/base'
import type { RegisteredMutation } from 'convex/server'
import type { DataModel } from './_generated/dataModel'
import { z } from 'zod'

export const generateUploadUrl = authMutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl()
  }
})

// Get URL for a single storage ID
export const getUrl = authQuery({
  args: { storageId: zid('_storage') },
  returns: z.string().nullable(),
  handler: async (ctx, { storageId }) => {
    return await ctx.storage.getUrl(storageId)
  }
})

// Get URLs for multiple storage IDs
export const getUrls = authQuery({
  args: { storageIds: z.array(zid('_storage')) },
  returns: z.array(
    z.object({
      storageId: zid('_storage'),
      url: z.string().nullable()
    })
  ),
  handler: async (ctx, { storageIds }) => {
    const urls = await Promise.all(
      storageIds.map(async (storageId) => ({
        storageId,
        url: await ctx.storage.getUrl(storageId)
      }))
    )
    return urls
  }
})

export const ensureOnlyFive = internalAction({
  args: {
    files: zodToConvex(zFileUploadObjectArray) // other args...
  },
  handler: async (ctx, args) => {
    while (args.files.length > 5) {
      const current = args.files.pop()
      console.log('deleting', current)
      await ctx.storage.delete(current!.storageId)
    }
  }
})
