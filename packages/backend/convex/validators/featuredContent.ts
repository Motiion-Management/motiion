import { zid } from 'convex-helpers/server/zodV4'
import { zodTable } from '@packages/zodvex'
import { z } from 'zod'

export const featuredContent = {
  title: z.string(),
  description: z.string(),
  media: zid('_storage'),
  contract: zid('_storage').optional(),
  link: z.string().optional()
}

export const zFeaturedContent = z.object(featuredContent)

export const FeaturedContent = zodTable('featuredContent', zFeaturedContent)
