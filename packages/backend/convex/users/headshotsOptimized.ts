import { v } from 'convex/values'
import { query } from '../_generated/server'

/**
 * Optimized query that returns headshot metadata immediately
 * URLs are generated client-side or through a separate query
 */
export const getMyHeadshotsMetadata = query({
  args: {},
  handler: async (ctx) => {
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
    return user.headshots.map((headshot, index) => ({
      id: `headshot-${index}`,
      storageId: headshot.storageId,
      title: headshot.title,
      uploadDate: headshot.uploadDate,
      position: (headshot as any).position ?? index
    }))
  }
})

/**
 * Separate query to get a single headshot URL
 * Called on-demand when the image needs to be displayed
 */
export const getHeadshotUrl = query({
  args: {
    storageId: v.id('_storage')
  },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, { storageId }) => {
    try {
      const url = await ctx.storage.getUrl(storageId)
      return url
    } catch {
      return null
    }
  }
})

/**
 * Batch query to get multiple headshot URLs
 * More efficient than multiple individual queries
 */
export const getHeadshotUrls = query({
  args: {
    storageIds: v.array(v.id('_storage'))
  },
  returns: v.array(
    v.object({
      storageId: v.id('_storage'),
      url: v.union(v.string(), v.null())
    })
  ),
  handler: async (ctx, { storageIds }) => {
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
  }
})
