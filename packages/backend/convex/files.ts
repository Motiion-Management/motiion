import { internalAction } from './_generated/server'
import { fileUploadObjectArray } from './schema'
import { authMutation } from './util'

export const generateUploadUrl = authMutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl()
  }
})

export const ensureOnlyFive = internalAction({
  args: {
    files: fileUploadObjectArray // other args...
  },
  handler: async (ctx, args) => {
    while (args.files.length > 5) {
      const current = args.files.pop()
      console.log('deleting', current)
      await ctx.storage.delete(current!.storageId)
    }
  }
})
