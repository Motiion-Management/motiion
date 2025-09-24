import { zid } from '@packages/zodvex'
import { zodTable } from '@packages/zodvex'
import { z } from 'zod'

export const featuredMembers = {
  choreographers: z.array(zid('users')).optional(),
  talent: z.array(zid('users')).optional()
}

export const zFeaturedMembers = z.object(featuredMembers)

// Now zodTable can accept either a ZodObject or the raw shape directly
export const FeaturedMembers = zodTable('featuredMembers', featuredMembers)
