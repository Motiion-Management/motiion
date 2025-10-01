import { query } from '../_generated/server'
import { ConvexError } from 'convex/values'
import { z } from 'zod'
import { zid } from '@packages/zodvex'
import { authQuery, authMutation, zq } from '../util'
import { Id } from '../_generated/dataModel'

// Profile type enum
export const zProfileEnum = z.enum(['dancer', 'choreographer'])
export type ProfileType = z.infer<typeof zProfileEnum>

// Active profile info
export interface ActiveProfile {
  type: ProfileType
  profileId: Id<'dancers'> | Id<'choreographers'>
  profile: any // Let consuming code handle the specific type
}

// Get the active profile for the authenticated user (any type)
export const getMyActiveProfile = authQuery({
  returns: z.any().nullable(),
  handler: async (ctx): Promise<ActiveProfile | null> => {
    if (!ctx.user) return null

    // Use discriminate values from users table for efficient lookup
    if (ctx.user.activeProfileType === 'dancer' && ctx.user.activeDancerId) {
      const dancerProfile = await ctx.db.get(ctx.user.activeDancerId)
      if (dancerProfile) {
        return {
          type: 'dancer',
          profileId: dancerProfile._id as Id<'dancers'>,
          profile: dancerProfile
        }
      }
    }

    if (ctx.user.activeProfileType === 'choreographer' && ctx.user.activeChoreographerId) {
      const choreoProfile = await ctx.db.get(ctx.user.activeChoreographerId)
      if (choreoProfile) {
        return {
          type: 'choreographer',
          profileId: choreoProfile._id as Id<'choreographers'>,
          profile: choreoProfile
        }
      }
    }

    return null
  }
})

// Get all profiles for a user (both dancers and choreographers)
export const getUserProfiles = zq({
  args: { userId: zid('users') },
  returns: z.any(),
  handler: async (ctx, { userId }) => {
    const [dancerProfiles, choreoProfiles] = await Promise.all([
      ctx.db
        .query('dancers')
        .withIndex('by_userId', (q) => q.eq('userId', userId))
        .collect(),
      ctx.db
        .query('choreographers')
        .withIndex('by_userId', (q) => q.eq('userId', userId))
        .collect()
    ])

    return {
      dancers: dancerProfiles,
      choreographers: choreoProfiles,
      total: dancerProfiles.length + choreoProfiles.length
    }
  }
})

// Switch between profiles (updates discriminate values on users table)
// TODO: Implement switchProfile handler
// export const switchProfile = authMutation({
//   args: { profileType: zProfileEnum, profileId: z.string() },
//   returns: z.object({ success: z.boolean() }),
//   handler: async (ctx, { profileType, profileId }) => {
//     // Implementation needed
//     return { success: false }
//   }
// })