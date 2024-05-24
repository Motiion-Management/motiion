import { zodToConvex } from 'convex-helpers/server/zod'
import { internalAction } from './_generated/server'
import { authMutation } from './util'
import { zFileUploadObjectArray } from './validators/resume'

export const generateUploadUrl = authMutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl()
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
