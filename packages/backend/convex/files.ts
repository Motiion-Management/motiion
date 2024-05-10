import { authMutation } from './util'

export const generateUploadUrl = authMutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl()
  }
})
