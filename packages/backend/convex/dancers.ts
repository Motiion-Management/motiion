import { ConvexError } from 'convex/values'
import { zid } from '@packages/zodvex'
import { zq, zm, zim, zAuthMutation } from './util'
import { z } from 'zod'
import { Dancers, zCreateDancerInput, zDancers } from './schemas/dancers'
import { zodDoc } from '@packages/zodvex'
import { crud } from 'convex-helpers/server/crud'
import schema from './schema'

export const { create, read, update, destroy, paginate } = crud(
  schema,
  'dancers'
)

export const get = zq({
  args: { id: zid('dancers') },
  returns: Dancers.zDoc.nullable(),
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id)
  }
})

// Create a new dancer profile
export const createDancerProfile = zAuthMutation({
  args: zCreateDancerInput,
  returns: zid('dancers'),
  handler: async (ctx, input) => {
    // Check if user already has a dancer profile
    const existing = await ctx.db
      .query('dancers')
      .withIndex('by_userId', (q) => q.eq('userId', ctx.user._id))
      .first()

    // If this is their first profile, mark as primary
    const isPrimary = !existing

    // Create the dancer profile
    const insertData: any = {
      ...input,
      userId: ctx.user._id,
      isPrimary,
      createdAt: new Date().toISOString(),
      profileCompleteness: 0,
      searchPattern: generateSearchPattern(input)
    }
    const profileId = await ctx.db.insert('dancers', insertData)

    // If this is the first dancer profile, set it as active
    if (isPrimary) {
      await ctx.db.patch(ctx.user._id, {
        activeProfileType: 'dancer',
        activeDancerId: profileId
      })
    }

    return profileId
  }
})

// Update dancer profile
export const updateDancerProfile = zAuthMutation({
  args: {
    profileId: zid('dancers'),
    updates: zDancers.partial()
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

// Set active dancer profile
export const setActiveDancerProfile = zAuthMutation({
  args: { profileId: zid('dancers') },
  returns: z.object({ success: z.boolean() }),
  handler: async (ctx, { profileId }) => {
    // Verify ownership
    const profile = await ctx.db.get(profileId)
    if (!profile || profile.userId !== ctx.user._id) {
      throw new ConvexError('Profile not found or access denied')
    }

    // Update discriminate values on users table
    await ctx.db.patch(ctx.user._id, {
      activeProfileType: 'dancer',
      activeDancerId: profileId,
      activeChoreographerId: undefined
    } as any)

    return { success: true }
  }
})

// Delete dancer profile (internal only, for cleanup)
export const deleteDancerProfile = zim({
  args: { profileId: zid('dancers') },
  returns: z.object({ success: z.boolean() }),
  handler: async (ctx, { profileId }) => {
    await ctx.db.delete(profileId)
    return { success: true }
  }
})

// Search dancers (public)
export const searchDancers = zq({
  args: {
    searchTerm: z.string(),
    limit: z.number().optional().default(10)
  },
  returns: z.array(Dancers.zDoc),
  handler: async (ctx, { searchTerm, limit }) => {
    const results = await ctx.db
      .query('dancers')
      .withSearchIndex('search_dancer', (q) =>
        q.search('searchPattern', searchTerm)
      )
      .take(limit)

    return results
  }
})

// Calculate dancer profile completeness percentage
export const calculateDancerCompleteness = zAuthMutation({
  args: { profileId: zid('dancers') },
  returns: z.object({ completeness: z.number() }),
  handler: async (ctx, { profileId }) => {
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
    if (
      profile.headshots &&
      Array.isArray(profile.headshots) &&
      profile.headshots.length > 0
    )
      score += weights.headshots
    if (profile.attributes) score += weights.attributes
    if (profile.sizing) score += weights.sizing
    if (
      profile.resume &&
      typeof profile.resume === 'object' &&
      'projects' in profile.resume &&
      Array.isArray(profile.resume.projects) &&
      profile.resume.projects.length > 0
    )
      score += weights.resume
    if (
      profile.resume &&
      typeof profile.resume === 'object' &&
      'skills' in profile.resume &&
      Array.isArray(profile.resume.skills) &&
      profile.resume.skills.length > 0
    )
      score += weights.skills
    if (
      profile.training &&
      Array.isArray(profile.training) &&
      profile.training.length > 0
    )
      score += weights.training
    if (profile.location) score += weights.location
    if (profile.links) score += weights.links
    if (profile.representation) score += weights.representation

    const completeness = Math.min(100, Math.round(score))

    // Update the profile with the new completeness
    await ctx.db.patch(profileId, { profileCompleteness: completeness })

    return { completeness }
  }
})

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
