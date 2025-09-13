import { zid, zodToConvexFields } from 'convex-helpers/server/zodV4'
import { Table } from 'convex-helpers/server'
import { z } from 'zod'

export const featuredMembers = {
  choreographers: z.array(zid('users')).optional(),
  talent: z.array(zid('users')).optional()
}

export const zFeaturedMembers = z.object(featuredMembers)

export const FeaturedMembers = Table(
  'featuredMembers',
  zodToConvexFields(featuredMembers)
)
