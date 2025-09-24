import { query } from '../_generated/server'
import { ConvexError } from 'convex/values'
import { zQuery, zMutation } from '@packages/zodvex'
import { z } from 'zod'
import { zid } from '@packages/zodvex'
import { authQuery, authMutation } from '../util'
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
export const getMyActiveProfile = zQuery(
  authQuery,
  {},
  async (ctx): Promise<ActiveProfile | null> => {
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
  },
  { returns: z.any().nullable() }
)

// Get all profiles for a user (both dancers and choreographers)
export const getUserProfiles = zQuery(
  query,
  { userId: zid('users') },
  async (ctx, { userId }) => {
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
  },
  { returns: z.any() }
)

// Switch between profiles (updates discriminate values on users table)
export const switchProfile = zMutation(
  authMutation,
  {
    profileType: zProfileEnum,
    profileId: z.string() // We'll validate the ID type based on profileType
  },
  async (ctx, { profileType, profileId }) => {
    // Validate the selected profile belongs to this user
    if (profileType === 'dancer') {
      const profile = await ctx.db.get(profileId as Id<'dancers'>)
      if (!profile || profile.userId !== ctx.user._id) {
        throw new ConvexError('Dancer profile not found or access denied')
      }
      // Update discriminate values on users table
      await ctx.db.patch(ctx.user._id, {
        activeProfileType: 'dancer',
        activeDancerId: profileId as Id<'dancers'>,
        activeChoreographerId: undefined
      })
    } else if (profileType === 'choreographer') {
      const profile = await ctx.db.get(profileId as Id<'choreographers'>)
      if (!profile || profile.userId !== ctx.user._id) {
        throw new ConvexError(
          'Choreographer profile not found or access denied'
        )
      }
      // Update discriminate values on users table
      await ctx.db.patch(ctx.user._id, {
        activeProfileType: 'choreographer',
        activeChoreographerId: profileId as Id<'choreographers'>,
        activeDancerId: undefined
      })
    }

    return { success: true }
  },
  { returns: z.object({ success: z.boolean() }) }
)
