import { query, mutation, internalMutation } from './_generated/server'
import { ConvexError } from 'convex/values'
import { zQuery, zMutation, zInternalMutation } from '@packages/zodvex'
import { z } from 'zod'
import { zid } from 'convex-helpers/server/zodV4'
import { authQuery, authMutation } from './util'
import { Dancers, zCreateDancerInput } from './schemas/dancers'

// Get the active dancer profile for the authenticated user
export const getMyDancerProfile = zQuery(
  authQuery,
  {},
  async (ctx) => {
    if (!ctx.user) return null

    return await ctx.db
      .query('dancers')
      .withIndex('by_userId_and_active', (q) =>
        q.eq('userId', ctx.user._id).eq('isActive', true)
      )
      .first()
  },
  { returns: z.any().nullable() }
)

// Get all dancer profiles for a user
export const getUserDancerProfiles = zQuery(
  query,
  { userId: zid('users') },
  async (ctx, { userId }) => {
    return await ctx.db
      .query('dancers')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .collect()
  },
  { returns: z.array(z.any()) }
)

// Create a new dancer profile
export const createDancerProfile = zMutation(
  authMutation,
  zCreateDancerInput,
  async (ctx, input) => {
    // Check if user already has a dancer profile
    const existing = await ctx.db
      .query('dancers')
      .withIndex('by_userId', (q) => q.eq('userId', ctx.user._id))
      .first()

    if (existing && existing.isActive) {
      throw new ConvexError('User already has an active dancer profile')
    }

    // If this is their first profile, mark as primary
    const isPrimary = !existing

    // Create the dancer profile
    const profileId = await ctx.db.insert('dancers', {
      ...input,
      userId: ctx.user._id,
      isActive: true,
      isPrimary,
      createdAt: new Date().toISOString(),
      profileCompleteness: 0,
      searchPattern: generateSearchPattern(input)
    })

    return profileId
  },
  { returns: zid('dancers') }
)

// Update dancer profile
export const updateDancerProfile = zMutation(
  authMutation,
  {
    profileId: zid('dancers'),
    updates: z.any()
  },
  async (ctx, { profileId, updates }) => {
    // Verify ownership
    const profile = await ctx.db.get(profileId)
    if (!profile || profile.userId !== ctx.user._id) {
      throw new ConvexError('Profile not found or access denied')
    }

    // Update the profile
    await ctx.db.patch(profileId, {
      ...updates,
      searchPattern: generateSearchPattern({ ...profile, ...updates })
    })

    return { success: true }
  },
  { returns: z.object({ success: z.boolean() }) }
)

// Set active dancer profile
export const setActiveDancerProfile = zMutation(
  authMutation,
  { profileId: zid('dancers') },
  async (ctx, { profileId }) => {
    // Verify ownership
    const profile = await ctx.db.get(profileId)
    if (!profile || profile.userId !== ctx.user._id) {
      throw new ConvexError('Profile not found or access denied')
    }

    // Deactivate all other dancer profiles for this user
    const allProfiles = await ctx.db
      .query('dancers')
      .withIndex('by_userId', (q) => q.eq('userId', ctx.user._id))
      .collect()

    for (const p of allProfiles) {
      if (p._id !== profileId && p.isActive) {
        await ctx.db.patch(p._id, { isActive: false })
      }
    }

    // Activate the selected profile
    await ctx.db.patch(profileId, { isActive: true })

    return { success: true }
  },
  { returns: z.object({ success: z.boolean() }) }
)

// Delete dancer profile (internal only, for cleanup)
export const deleteDancerProfile = zInternalMutation(
  internalMutation,
  { profileId: zid('dancers') },
  async (ctx, { profileId }) => {
    await ctx.db.delete(profileId)
    return { success: true }
  },
  { returns: z.object({ success: z.boolean() }) }
)

// Search dancers (public)
export const searchDancers = zQuery(
  query,
  {
    searchTerm: z.string(),
    limit: z.number().optional().default(10)
  },
  async (ctx, { searchTerm, limit }) => {
    const results = await ctx.db
      .query('dancers')
      .withSearchIndex('search_dancer', (q) =>
        q.search('searchPattern', searchTerm)
      )
      .take(limit)

    return results
  },
  { returns: z.array(z.any()) }
)

// Calculate dancer profile completeness percentage
export const calculateDancerCompleteness = zMutation(
  authMutation,
  { profileId: zid('dancers') },
  async (ctx, { profileId }) => {
    const profile = await ctx.db.get(profileId)
    if (!profile || profile.userId !== ctx.user._id) {
      throw new ConvexError('Profile not found or access denied')
    }

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

    let score = 0
    if (profile.headshots && profile.headshots.length > 0) score += weights.headshots
    if (profile.attributes) score += weights.attributes
    if (profile.sizing) score += weights.sizing
    if (profile.resume?.projects && profile.resume.projects.length > 0) score += weights.resume
    if (profile.resume?.skills && profile.resume.skills.length > 0) score += weights.skills
    if (profile.training && profile.training.length > 0) score += weights.training
    if (profile.location) score += weights.location
    if (profile.links) score += weights.links
    if (profile.representation) score += weights.representation

    const completeness = Math.min(100, Math.round(score))

    // Update the profile with the new completeness
    await ctx.db.patch(profileId, { profileCompleteness: completeness })

    return { completeness }
  },
  { returns: z.object({ completeness: z.number() }) }
)

// Helper function to generate search pattern
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