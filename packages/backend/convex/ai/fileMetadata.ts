import { internalQuery } from '../_generated/server'
import { v } from 'convex/values'
import { Id } from '../_generated/dataModel'

// Query to get file metadata from the _storage system table
export const getFileMetadata = internalQuery({
  args: { storageId: v.id('_storage') },
  returns: v.union(
    v.object({
      _id: v.id('_storage'),
      _creationTime: v.number(),
      contentType: v.optional(v.string()),
      size: v.number(),
      sha256: v.string()
    }),
    v.null()
  ),
  handler: async (
    ctx,
    args
  ): Promise<{
    _id: Id<'_storage'>
    _creationTime: number
    contentType?: string
    size: number
    sha256: string
  } | null> => {
    return await ctx.db.system.get(args.storageId)
  }
})
