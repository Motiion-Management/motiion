import { query, mutation } from '../_generated/server'
import { ConvexError } from 'convex/values'
import { zQuery, zMutation } from '@packages/zodvex'
import { z } from 'zod'
import { zid } from 'convex-helpers/server/zodV4'
import { authQuery, authMutation } from '../util'
import { Doc, Id } from '../_generated/dataModel'

// Profile type enum
export const ProfileType = z.enum(['dancer', 'choreographer'])
export type ProfileType = z.infer<typeof ProfileType>

// Active profile info
export interface ActiveProfile {
  type: ProfileType
  profileId: Id<'dancers'> | Id<'choreographers'>
  profile: Doc<'dancers'> | Doc<'choreographers'> | null
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
    profileType: ProfileType,
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
        throw new ConvexError('Choreographer profile not found or access denied')
      }
      await ctx.db.patch(profileId as Id<'choreographers'>, { isActive: true })
    }

    return { success: true }
  },
  { returns: z.object({ success: z.boolean() }) }
)

// Calculate profile completeness percentage
export function calculateProfileCompleteness(
  profile: Doc<'dancers'> | Doc<'choreographers'>,
  type: ProfileType
): number {
  let score = 0

  if (type === 'dancer') {
    const dancerProfile = profile as Doc<'dancers'>
    const weights = {
      headshots: 20,
      attributes: 15,
      sizing: 10,
      resume: 15,
      skills: 10,
      training: 10,
      location: 10,
      links: 5,
      representation: 5
    }

    if (dancerProfile.headshots && dancerProfile.headshots.length > 0) score += weights.headshots
    if (dancerProfile.attributes) score += weights.attributes
    if (dancerProfile.sizing) score += weights.sizing
    if (dancerProfile.resume?.projects && dancerProfile.resume.projects.length > 0) score += weights.resume
    if (dancerProfile.resume?.skills && dancerProfile.resume.skills.length > 0) score += weights.skills
    if (dancerProfile.training && dancerProfile.training.length > 0) score += weights.training
    if (dancerProfile.location) score += weights.location
    if (dancerProfile.links) score += weights.links
    if (dancerProfile.representation) score += weights.representation
  } else {
    const choreoProfile = profile as Doc<'choreographers'>
    const weights = {
      headshots: 20,
      companyName: 15,
      resume: 20,
      specialties: 15,
      location: 10,
      links: 10,
      notableWorks: 10
    }

    if (choreoProfile.headshots && choreoProfile.headshots.length > 0) score += weights.headshots
    if (choreoProfile.companyName) score += weights.companyName
    if (choreoProfile.resume) score += weights.resume
    if (choreoProfile.specialties && choreoProfile.specialties.length > 0) score += weights.specialties
    if (choreoProfile.location) score += weights.location
    if (choreoProfile.links) score += weights.links
    if (choreoProfile.notableWorks && choreoProfile.notableWorks.length > 0) score += weights.notableWorks
  }

  return Math.min(100, Math.round(score))
}

// Update profile completeness (internal helper)
export const updateProfileCompleteness = zMutation(
  authMutation,
  {
    profileType: ProfileType,
    profileId: z.string()
  },
  async (ctx, { profileType, profileId }) => {
    if (profileType === 'dancer') {
      const profile = await ctx.db.get(profileId as Id<'dancers'>)
      if (!profile || profile.userId !== ctx.user._id) {
        throw new ConvexError('Profile not found')
      }
      const completeness = calculateProfileCompleteness(profile, 'dancer')
      await ctx.db.patch(profileId as Id<'dancers'>, { profileCompleteness: completeness })
    } else {
      const profile = await ctx.db.get(profileId as Id<'choreographers'>)
      if (!profile || profile.userId !== ctx.user._id) {
        throw new ConvexError('Profile not found')
      }
      const completeness = calculateProfileCompleteness(profile, 'choreographer')
      await ctx.db.patch(profileId as Id<'choreographers'>, { profileCompleteness: completeness })
    }

    return { success: true }
  },
  { returns: z.object({ success: z.boolean() }) }
)