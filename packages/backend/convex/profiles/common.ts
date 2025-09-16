import { query } from '../_generated/server'
import { ConvexError } from 'convex/values'
import { zQuery, zMutation } from '@packages/zodvex'
import { z } from 'zod'
import { zid } from 'convex-helpers/server/zodV4'
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

    // Check for active dancer profile
    const dancerProfile = await ctx.db
      .query('dancers')
      .withIndex('by_userId_and_active', (q) =>
        q.eq('userId', ctx.user._id).eq('isActive', true)
      )
      .first()

    if (dancerProfile) {
      return {
        type: 'dancer',
        profileId: dancerProfile._id,
        profile: dancerProfile
      }
    }

    // Check for active choreographer profile
    const choreoProfile = await ctx.db
      .query('choreographers')
      .withIndex('by_userId_and_active', (q) =>
        q.eq('userId', ctx.user._id).eq('isActive', true)
      )
      .first()

    if (choreoProfile) {
      return {
        type: 'choreographer',
        profileId: choreoProfile._id,
        profile: choreoProfile
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

// Switch between profiles (deactivates current, activates selected)
export const switchProfile = zMutation(
  authMutation,
  {
    profileType: zProfileEnum,
    profileId: z.string() // We'll validate the ID type based on profileType
  },
  async (ctx, { profileType, profileId }) => {
    // First, deactivate all profiles for this user
    const [dancerProfiles, choreoProfiles] = await Promise.all([
      ctx.db
        .query('dancers')
        .withIndex('by_userId', (q) => q.eq('userId', ctx.user._id))
        .collect(),
      ctx.db
        .query('choreographers')
        .withIndex('by_userId', (q) => q.eq('userId', ctx.user._id))
        .collect()
    ])

    // Deactivate all profiles
    for (const profile of dancerProfiles) {
      if (profile.isActive) {
        await ctx.db.patch(profile._id, { isActive: false })
      }
    }
    for (const profile of choreoProfiles) {
      if (profile.isActive) {
        await ctx.db.patch(profile._id, { isActive: false })
      }
    }

    // Activate the selected profile
    if (profileType === 'dancer') {
      const profile = await ctx.db.get(profileId as Id<'dancers'>)
      if (!profile || profile.userId !== ctx.user._id) {
        throw new ConvexError('Dancer profile not found or access denied')
      }
      await ctx.db.patch(profileId as Id<'dancers'>, { isActive: true })
    } else if (profileType === 'choreographer') {
      const profile = await ctx.db.get(profileId as Id<'choreographers'>)
      if (!profile || profile.userId !== ctx.user._id) {
        throw new ConvexError(
          'Choreographer profile not found or access denied'
        )
      }
      await ctx.db.patch(profileId as Id<'choreographers'>, { isActive: true })
    }

    return { success: true }
  },
  { returns: z.object({ success: z.boolean() }) }
)
