import { Id } from '../_generated/dataModel'
import { z } from 'zod'
import { zid } from 'zodvex'
import { ziq } from '../util'

// Define the file metadata schema
const fileMetadataSchema = z.object({
  _id: zid('_storage'),
  _creationTime: z.number(),
  contentType: z.string().optional(),
  size: z.number(),
  sha256: z.string()
})

// Query to get file metadata from the _storage system table
export const getFileMetadata = ziq({
  args: { storageId: zid('_storage') },
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
  },
  returns: z.union([fileMetadataSchema, z.null()])
})
