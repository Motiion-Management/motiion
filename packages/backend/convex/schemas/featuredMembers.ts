import { zid } from 'zodvex'
import { zodTable } from 'zodvex'
import { z } from 'zod'

export const featuredMembers = {
  choreographers: z.array(zid('users')).optional(),
  talent: z.array(zid('users')).optional()
}

export const zFeaturedMembers = z.object(featuredMembers)

export const FeaturedMembers = zodTable('featuredMembers', zFeaturedMembers)
