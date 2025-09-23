import { zInternalAction, zMutation } from 'zodvex'
import { internalAction } from './_generated/server'
import { authMutation } from './util'
import { zFileUploadObjectArray } from './schemas/base'
import { z } from 'zod'

export const generateUploadUrl = zMutation(
  authMutation,
  {},
  async (ctx) => {
    return await ctx.storage.generateUploadUrl()
  },
  { returns: z.string() }
)

export const ensureOnlyFive = zInternalAction(
  internalAction,
  { files: zFileUploadObjectArray },
  async (ctx, { files }) => {
    while (files.length > 5) {
      const current = files.pop()
      console.log('deleting', current)
      await ctx.storage.delete(current!.storageId)
    }
  }
)
