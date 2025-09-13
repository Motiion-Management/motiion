import { zid, zodToConvexFields } from 'convex-helpers/server/zodV4'
import { Table } from 'convex-helpers/server'
import { z } from 'zod'

export const featuredContent = {
  title: z.string(),
  description: z.string(),
  media: zid('_storage'),
  contract: zid('_storage').optional(),
  link: z.string().optional()
}

export const zFeaturedContent = z.object(featuredContent)

export const FeaturedContent = Table(
  'featuredContent',
  zodToConvexFields(featuredContent)
)
