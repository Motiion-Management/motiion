import type { Id } from '../_generated/dataModel'
import { query } from '../_generated/server'
import { zQuery } from '@packages/zodvex'
import { z } from 'zod'
import { zid } from '@packages/zodvex'

/**
 * Optimized query that returns headshot metadata immediately
 * URLs are generated client-side or through a separate query
 */
export const getMyHeadshotsMetadata = zQuery(
  query,
  {},
  async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const user = await ctx.db
      .query('users')
      .withIndex('tokenId', (q) => q.eq('tokenId', identity.subject))
      .unique()

    if (!user?.headshots) {
      return []
    }

    // Return headshot metadata without URLs, including position (defaulting to index)
    type Headshot = { storageId: Id<'_storage'>; title?: string; uploadDate: string; position?: number }
    return user.headshots.map((headshot: Headshot, index: number) => ({
      id: `headshot-${index}`,
      storageId: headshot.storageId,
      title: headshot.title,
      uploadDate: headshot.uploadDate,
      position: (headshot as any).position ?? index
    }))
  }
)

/**
 * Separate query to get a single headshot URL
 * Called on-demand when the image needs to be displayed
 */
export const getHeadshotUrl = zQuery(
  query,
  { storageId: zid('_storage') },
  async (ctx, { storageId }) => {
    try {
      const url = await ctx.storage.getUrl(storageId)
      return url
    } catch {
      return null
    }
  },
  { returns: z.union([z.string(), z.null()]) }
)

/**
 * Batch query to get multiple headshot URLs
 * More efficient than multiple individual queries
 */
export const getHeadshotUrls = zQuery(
  query,
  { storageIds: z.array(zid('_storage')) },
  async (ctx, { storageIds }) => {
    const urls = await Promise.all(
      storageIds.map(async (storageId) => {
        try {
          const url = await ctx.storage.getUrl(storageId)
          return { storageId, url }
        } catch {
          return { storageId, url: null }
        }
      })
    )
    return urls
  },
  {
    returns: z.array(
      z.object({
        storageId: zid('_storage'),
        url: z.union([z.string(), z.null()])
      })
    )
  }
)
