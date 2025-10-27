import { query, mutation, internalMutation } from './_generated/server'
import { ConvexError } from 'convex/values'
import { z } from 'zod'
import { zid } from 'zodvex'
import { authMutation, authQuery, zim, zq, zm } from './util'
import {
  Choreographers,
  zCreateChoreographerInput,
  zChoreographers,
  ChoreographerDoc
} from './schemas/choreographers'
import { zodDoc, zodDocOrNull } from 'zodvex'

const zChoreographerDoc = zodDoc('choreographers', zChoreographers)
const zChoreographerDocOrNull = zodDocOrNull('choreographers', zChoreographers)

// Get the active choreographer profile for the authenticated user
export const getMyChoreographerProfile = authQuery({
  handler: async (ctx) => {
    if (!ctx.user) return null

    // Use discriminate value from users table for efficient lookup
    if (
      ctx.user.activeProfileType === 'choreographer' &&
      ctx.user.activeChoreographerId
    ) {
      return await ctx.db.get(ctx.user.activeChoreographerId)
    }

    return null
  }
})

// Get all choreographer profiles for a user
export const getUserChoreographerProfiles = zq({
  args: { userId: zid('users') },
  returns: z.array(zChoreographerDoc),
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query('choreographers')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .collect()
  }
})

// Create a new choreographer profile
export const createChoreographerProfile = authMutation({
  args: zCreateChoreographerInput,
  returns: zid('choreographers'),
  handler: async (ctx, input) => {
    // Check if user already has a choreographer profile
    const existing = await ctx.db
      .query('choreographers')
      .withIndex('by_userId', (q) => q.eq('userId', ctx.user._id))
      .first()

    // If this is their first profile, mark as primary
    const isPrimary = !existing

    // Create the choreographer profile
    const insertData: any = {
      ...input,
      userId: ctx.user._id,
      isPrimary,
      createdAt: new Date().toISOString(),
      profileCompleteness: 0,
      verified: false,
      featured: false,
      searchPattern: generateSearchPattern(input)
    }
    const profileId = await ctx.db.insert('choreographers', insertData)

    // If this is the first choreographer profile, set it as active
    if (isPrimary) {
      await ctx.db.patch(ctx.user._id, {
        activeProfileType: 'choreographer',
        activeChoreographerId: profileId
      })
    }

    return profileId
  }
})

// Update choreographer profile
export const updateChoreographerProfile = authMutation({
  args: {
    profileId: zid('choreographers'),
    updates: zChoreographers.partial()
  },
  returns: z.object({ success: z.boolean() }),
  handler: async (ctx, { profileId, updates }) => {
    // Verify ownership
    const profile = await ctx.db.get(profileId)
    if (!profile || profile.userId !== ctx.user._id) {
      throw new ConvexError('Profile not found or access denied')
    }

    // Update the profile
    const patchData: any = {
      ...updates,
      searchPattern: generateSearchPattern({ ...profile, ...updates })
    }
    await ctx.db.patch(profileId, patchData)

    return { success: true }
  }
})

// Set active choreographer profile
export const setActiveChoreographerProfile = authMutation({
  args: { profileId: zid('choreographers') },
  returns: z.object({ success: z.boolean() }),
  handler: async (ctx, { profileId }) => {
    // Verify ownership
    const profile = await ctx.db.get(profileId)
    if (!profile || profile.userId !== ctx.user._id) {
      throw new ConvexError('Profile not found or access denied')
    }

    // Update discriminate values on users table
    await ctx.db.patch(ctx.user._id, {
      activeProfileType: 'choreographer',
      activeChoreographerId: profileId,
      activeDancerId: undefined
    } as any)

    return { success: true }
  }
})

// ============================================================================
// ACTIVE PROFILE MUTATIONS (automatically target user's active choreographer profile)
// ============================================================================

// Update arbitrary fields on the active choreographer profile
export const updateMyChoreographerProfile = authMutation({
  args: zChoreographers.partial(),
  returns: z.null(),
  handler: async (ctx, updates) => {
    if (!ctx.user.activeChoreographerId) {
      throw new ConvexError('No active choreographer profile found')
    }

    const profile = await ctx.db.get(ctx.user.activeChoreographerId)
    if (!profile || profile.userId !== ctx.user._id) {
      throw new ConvexError('Profile not found or access denied')
    }

    const patchData: any = {
      ...updates,
      searchPattern: generateSearchPattern({ ...profile, ...updates })
    }
    await ctx.db.patch(ctx.user.activeChoreographerId, patchData)

    return null
  }
})

// Search choreographers (public)
export const searchChoreographers = zq({
  args: {
    searchTerm: z.string(),
    limit: z.number().optional().default(10)
  },
  handler: async (ctx, { searchTerm, limit }) => {
    const results = await ctx.db
      .query('choreographers')
      .withSearchIndex('search_choreographer', (q) =>
        q.search('searchPattern', searchTerm)
      )
      .take(limit)

    return results
  }
})

// Calculate choreographer profile completeness percentage
export const calculateChoreographerCompleteness = authMutation({
  args: { profileId: zid('choreographers') },
  returns: z.object({ completeness: z.number() }),
  handler: async (ctx, { profileId }) => {
    const profile = await ctx.db.get(profileId)
    if (!profile || profile.userId !== ctx.user._id) {
      throw new ConvexError('Profile not found or access denied')
    }

    const weights = {
      headshots: 20,
      resume: 20,
      companyName: 15,
      databaseUse: 10,
      location: 15,
      links: 10,
      representation: 10
    }

    let score = 0
    if (
      profile.headshots &&
      Array.isArray(profile.headshots) &&
      profile.headshots.length > 0
    )
      score += weights.headshots
    if (
      profile.resume &&
      typeof profile.resume === 'object' &&
      'projects' in profile.resume &&
      Array.isArray(profile.resume.projects) &&
      profile.resume.projects.length > 0
    )
      score += weights.resume
    if (profile.companyName) score += weights.companyName
    if (profile.databaseUse) score += weights.databaseUse
    if (profile.location) score += weights.location
    if (profile.links) score += weights.links
    if (profile.representation) score += weights.representation

    const completeness = Math.min(100, Math.round(score))

    // Update the profile with the new completeness
    await ctx.db.patch(profileId, { profileCompleteness: completeness })

    return { completeness }
  }
})

function generateSearchPattern(data: any): string {
  const parts = []

  // Add basic info if available
  if (data.attributes?.ethnicity) parts.push(data.attributes.ethnicity)
  if (data.attributes?.gender) parts.push(data.attributes.gender)
  if (data.attributes?.hairColor) parts.push(data.attributes.hairColor)

  // Add skills
  if (data.resume?.skills) parts.push(...data.resume.skills)
  if (data.resume?.genres) parts.push(...data.resume.genres)

  // Add location
  if (data.location?.city) parts.push(data.location.city)
  if (data.location?.state) parts.push(data.location.state)

  // Add dance styles (future field)
  if (data.danceStyles) parts.push(...data.danceStyles)

  return parts.filter(Boolean).join(' ').toLowerCase()
}
