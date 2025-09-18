import { query } from '../_generated/server'
import { ConvexError } from 'convex/values'
import { zQuery, zMutation, zid } from 'zodvex'
import { z } from 'zod'
import { authQuery, authMutation } from '../util'
import { Id } from '../_generated/dataModel'
import { zDancers } from '../schemas/dancers'
import { zChoreographers } from '../schemas/choreographers'

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
const zDancerDoc = zDancers.extend({ _id: zid('dancers'), _creationTime: z.number() })
const zChoreoDoc = zChoreographers.extend({ _id: zid('choreographers'), _creationTime: z.number() })

export const getMyActiveProfile = zQuery(
  authQuery,
  {},
  async (ctx): Promise<ActiveProfile | null> => {
    if (!ctx.user) return null

    // Use discriminate values from users table for efficient lookup
    if (ctx.user.activeProfileType === 'dancer' && ctx.user.activeDancerId) {
      const dancerProfile = await ctx.db.get(ctx.user.activeDancerId)
      if (dancerProfile) {
        const typed = zDancerDoc.parse(dancerProfile)
        return {
          type: 'dancer',
          profileId: typed._id as Id<'dancers'>,
          profile: typed
        }
      }
    }

    if (
      ctx.user.activeProfileType === 'choreographer' &&
      ctx.user.activeChoreographerId
    ) {
      const choreoProfile = await ctx.db.get(ctx.user.activeChoreographerId)
      if (choreoProfile) {
        const typed = zChoreoDoc.parse(choreoProfile)
        return {
          type: 'choreographer',
          profileId: typed._id as Id<'choreographers'>,
          profile: typed
        }
      }
    }

    return null
  },
  {
    returns: z
      .object({
        type: zProfileEnum,
        profileId: z.union([zid('dancers'), zid('choreographers')]),
        profile: z.union([zDancerDoc, zChoreoDoc])
      })
      .nullable()
  }
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

    const dancersTyped = z.array(zDancerDoc).parse(dancerProfiles)
    const choreosTyped = z.array(zChoreoDoc).parse(choreoProfiles)

    return {
      dancers: dancersTyped,
      choreographers: choreosTyped,
      total: dancersTyped.length + choreosTyped.length
    }
  },
  {
    returns: z.object({
      dancers: z.array(zDancerDoc),
      choreographers: z.array(zChoreoDoc),
      total: z.number()
    })
  }
)

// Switch between profiles (updates discriminate values on users table)
export const switchProfile = zMutation(
  authMutation,
  {
    profileType: zProfileEnum,
    profileId: z.union([zid('dancers'), zid('choreographers')])
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
