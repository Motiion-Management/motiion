import { query, mutation, internalMutation } from './_generated/server'
import { ConvexError } from 'convex/values'
import { zQuery, zMutation, zInternalMutation } from '@packages/zodvex'
import { z } from 'zod'
import { zid } from '@packages/zodvex'
import { authQuery, authMutation } from './util'
import { Choreographers, zCreateChoreographerInput, zChoreographers, ChoreographerDoc } from './schemas/choreographers'
import { zodDoc, zodDocOrNull } from '@packages/zodvex'

const zChoreographerDoc = zodDoc('choreographers', zChoreographers)
const zChoreographerDocOrNull = zodDocOrNull('choreographers', zChoreographers)

// Get the active choreographer profile for the authenticated user
export const getMyChoreographerProfile = zQuery(
  authQuery,
  {},
  async (ctx) => {
    if (!ctx.user) return null

    // Use discriminate value from users table for efficient lookup
    if (ctx.user.activeProfileType === 'choreographer' && ctx.user.activeChoreographerId) {
      return await ctx.db.get(ctx.user.activeChoreographerId)
    }

    return null
  },
  { returns: zChoreographerDocOrNull }
)

// Get all choreographer profiles for a user
export const getUserChoreographerProfiles = zQuery(
  query,
  { userId: zid('users') },
  async (ctx, { userId }) => {
    return await ctx.db
      .query('choreographers')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .collect()
  },
  { returns: z.array(zChoreographerDoc) }
)

// Create a new choreographer profile
export const createChoreographerProfile = zMutation(
  authMutation,
  zCreateChoreographerInput,
  async (ctx, input) => {
    // Check if user already has a choreographer profile
    const existing = await ctx.db
      .query('choreographers')
      .withIndex('by_userId', (q) => q.eq('userId', ctx.user._id))
      .first()

    // If this is their first profile, mark as primary
    const isPrimary = !existing

    // Create the choreographer profile
    const profileId = await ctx.db.insert('choreographers', {
      ...input,
      userId: ctx.user._id,
      isPrimary,
      createdAt: new Date().toISOString(),
      profileCompleteness: 0,
      verified: false,
      featured: false,
      searchPattern: generateSearchPattern(input)
    })

    // If this is the first choreographer profile, set it as active
    if (isPrimary) {
      await ctx.db.patch(ctx.user._id, {
        activeProfileType: 'choreographer',
        activeChoreographerId: profileId
      })
    }

    return profileId
  },
  { returns: zid('choreographers') }
)

// Update choreographer profile
export const updateChoreographerProfile = zMutation(
  authMutation,
  {
    profileId: zid('choreographers'),
    updates: zChoreographers.partial()
  },
  async (ctx, { profileId, updates }) => {
    // Verify ownership
    const profile = await ctx.db.get(profileId)
    if (!profile || profile.userId !== ctx.user._id) {
      throw new ConvexError('Profile not found or access denied')
    }

    // Don't allow users to set their own verified/featured status
    delete updates.verified
    delete updates.featured

    // Update the profile
    await ctx.db.patch(profileId, {
      ...updates,
      searchPattern: generateSearchPattern({ ...profile, ...updates })
    })

    return { success: true }
  },
  { returns: z.object({ success: z.boolean() }) }
)

// Set active choreographer profile
export const setActiveChoreographerProfile = zMutation(
  authMutation,
  { profileId: zid('choreographers') },
  async (ctx, { profileId }) => {
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
    })

    return { success: true }
  },
  { returns: z.object({ success: z.boolean() }) }
)

// Get verified choreographers (public)
export const getVerifiedChoreographers = zQuery(
  query,
  { limit: z.number().optional().default(10) },
  async (ctx, { limit }) => {
    return await ctx.db
      .query('choreographers')
      .withIndex('by_verified', (q) => q.eq('verified', true))
      .take(limit)
  },
  { returns: z.array(zChoreographerDoc) }
)

// Delete choreographer profile (internal only, for cleanup)
export const deleteChoreographerProfile = zInternalMutation(
  internalMutation,
  { profileId: zid('choreographers') },
  async (ctx, { profileId }) => {
    await ctx.db.delete(profileId)
    return { success: true }
  },
  { returns: z.object({ success: z.boolean() }) }
)

// Search choreographers (public)
export const searchChoreographers = zQuery(
  query,
  {
    searchTerm: z.string(),
    verifiedOnly: z.boolean().optional().default(false),
    limit: z.number().optional().default(10)
  },
  async (ctx, { searchTerm, verifiedOnly, limit }) => {
    let results = await ctx.db
      .query('choreographers')
      .withSearchIndex('search_choreographer', (q) =>
        q.search('searchPattern', searchTerm)
      )
      .collect()

    // Filter by verified if requested
    if (verifiedOnly) {
      results = results.filter(r => r.verified === true)
    }

    return results.slice(0, limit)
  },
  { returns: z.array(zChoreographerDoc) }
)

// Admin function to verify a choreographer
export const verifyChoreographer = zInternalMutation(
  internalMutation,
  {
    profileId: zid('choreographers'),
    verified: z.boolean()
  },
  async (ctx, { profileId, verified }) => {
    await ctx.db.patch(profileId, { verified })
    return { success: true }
  },
  { returns: z.object({ success: z.boolean() }) }
)

// Calculate choreographer profile completeness percentage
export const calculateChoreographerCompleteness = zMutation(
  authMutation,
  { profileId: zid('choreographers') },
  async (ctx, { profileId }) => {
    const profile = await ctx.db.get(profileId)
    if (!profile || profile.userId !== ctx.user._id) {
      throw new ConvexError('Profile not found or access denied')
    }

    const weights = {
      headshots: 20,
      companyName: 15,
      resume: 20,
      specialties: 15,
      location: 10,
      links: 10,
      notableWorks: 10
    }

    let score = 0
    if (profile.headshots && profile.headshots.length > 0) score += weights.headshots
    if (profile.companyName) score += weights.companyName
    if (profile.resume) score += weights.resume
    if (profile.specialties && profile.specialties.length > 0) score += weights.specialties
    if (profile.location) score += weights.location
    if (profile.links) score += weights.links
    if (profile.notableWorks && profile.notableWorks.length > 0) score += weights.notableWorks

    const completeness = Math.min(100, Math.round(score))

    // Update the profile with the new completeness
    await ctx.db.patch(profileId, { profileCompleteness: completeness })

    return { completeness }
  },
  { returns: z.object({ completeness: z.number() }) }
)

// Helper function to generate search pattern
function generateSearchPattern(data: Partial<ChoreographerDoc>): string {
  const parts = []

  // Add company name
  if (data.companyName) parts.push(data.companyName)

  // Add specialties
  if (data.specialties) parts.push(...data.specialties)

  // Add location
  if (data.location?.city) parts.push(data.location.city)
  if (data.location?.state) parts.push(data.location.state)

  // Add notable works
  if (data.notableWorks) parts.push(...data.notableWorks)

  // Add skills/genres from resume
  if (data.resume?.skills) parts.push(...data.resume.skills)
  if (data.resume?.genres) parts.push(...data.resume.genres)

  return parts.filter(Boolean).join(' ').toLowerCase()
}