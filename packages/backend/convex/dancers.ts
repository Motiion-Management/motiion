import { ConvexError } from 'convex/values'
import { zid } from 'zodvex'
import { zq, zm, zim, zAuthMutation, authQuery } from './util'
import { z } from 'zod'
import { Dancers, zCreateDancerInput, zDancers } from './schemas/dancers'
import { zodDoc } from 'zodvex'
import { crud } from 'convex-helpers/server/crud'
import schema from './schema'
import { attributesPlainObject } from './schemas/attributes'
import { sizingPlainObject } from './schemas/sizing'

export const { create, read, update, destroy, paginate } = crud(
  schema,
  'dancers'
)

export const get = zq({
  args: { id: zid('dancers') },
  returns: Dancers.zDoc.nullable(),
  handler: async (ctx, { id }) => {
    const dancer = await ctx.db.get(id)
    return dancer
  }
})

// Get full dancer profile with all related data for profile screen
export const getDancerProfileWithDetails = zq({
  args: { dancerId: zid('dancers') },
  returns: z
    .object({
      dancer: Dancers.zDoc,
      headshotUrls: z.array(z.string()),
      recentProjects: z.array(z.any()),
      allProjects: z.array(z.any()),
      training: z.array(z.any()),
      isOwnProfile: z.boolean()
    })
    .nullable(),
  handler: async (ctx, { dancerId }) => {
    console.log('dancer id', dancerId)
    const dancer = await ctx.db.get(dancerId)
    console.log(dancer)
    if (!dancer) return null

    // Get authenticated user for ownership check
    const identity = await ctx.auth.getUserIdentity()
    const isOwnProfile = identity ? dancer.userId === identity.subject : false

    // Resolve headshot URLs
    const headshotUrls: Array<string> = []
    if (dancer.headshots && Array.isArray(dancer.headshots)) {
      for (const headshot of dancer.headshots) {
        if (headshot.storageId) {
          const url = await ctx.storage.getUrl(headshot.storageId)
          if (url) headshotUrls.push(url)
        }
      }
    }

    // Get all projects for this profile
    const allProjects = await ctx.db
      .query('projects')
      .withIndex('by_profileId', (q) => q.eq('profileId', dancerId))
      .order('desc')
      .collect()

    // Get recent projects (top 2)
    const recentProjects = allProjects.slice(0, 2)

    // Get training records
    const training = await ctx.db
      .query('training')
      .withIndex('by_profileId', (q) => q.eq('profileId', dancerId))
      .collect()

    return {
      dancer,
      headshotUrls,
      recentProjects,
      allProjects,
      training,
      isOwnProfile
    }
  }
})

// Get the active dancer profile for the authenticated user
export const getMyDancerProfile = authQuery({
  args: {},
  returns: Dancers.zDoc.nullable(),
  handler: async (ctx) => {
    if (!ctx.user) return null

    // Use discriminate value from users table for efficient lookup
    if (ctx.user.activeProfileType === 'dancer' && ctx.user.activeDancerId) {
      return await ctx.db.get(ctx.user.activeDancerId)
    }

    return null
  }
})

// Get the current user's active dancer headshot URL
export const getMyDancerHeadshotUrl = authQuery({
  returns: z.union([z.string(), z.null()]),
  handler: async (ctx) => {
    if (!ctx.user || !ctx.user.activeDancerId) {
      return null
    }

    const dancer = await ctx.db.get(ctx.user.activeDancerId)
    if (!dancer || !dancer.headshots || dancer.headshots.length === 0) {
      return null
    }

    // Get the first headshot's storage URL
    const firstHeadshot = dancer.headshots[0]
    if (!firstHeadshot || !firstHeadshot.storageId) {
      return null
    }

    try {
      const url = await ctx.storage.getUrl(firstHeadshot.storageId)
      return url
    } catch {
      return null
    }
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

    // Create the dancer profile with initial onboarding state
    const insertData: any = {
      ...input,
      userId: ctx.user._id,
      isPrimary,
      createdAt: new Date().toISOString(),
      profileCompleteness: 0,
      searchPattern: generateSearchPattern(input),
      // Initialize onboarding state
      onboardingCompleted: false,
      currentOnboardingStep: 'headshots',
      currentOnboardingStepIndex: 1
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

// ============================================================================
// ACTIVE PROFILE MUTATIONS (automatically target user's active dancer profile)
// ============================================================================

// Update arbitrary fields on the active dancer profile
export const updateMyDancerProfile = zAuthMutation({
  args: zDancers.partial(),
  returns: z.null(),
  handler: async (ctx, updates) => {
    if (!ctx.user.activeDancerId) {
      throw new ConvexError('No active dancer profile found')
    }

    const profile = await ctx.db.get(ctx.user.activeDancerId)
    if (!profile || profile.userId !== ctx.user._id) {
      throw new ConvexError('Profile not found or access denied')
    }

    const patchData: any = {
      ...updates,
      searchPattern: generateSearchPattern({ ...profile, ...updates })
    }
    await ctx.db.patch(ctx.user.activeDancerId, patchData)

    return null
  }
})

// Patch specific attributes on the active dancer profile
export const patchDancerAttributes = zAuthMutation({
  args: { attributes: z.object(attributesPlainObject).partial() },
  returns: z.null(),
  handler: async (ctx, { attributes }) => {
    if (!ctx.user.activeDancerId) {
      throw new ConvexError('No active dancer profile found')
    }

    const profile = await ctx.db.get(ctx.user.activeDancerId)
    if (!profile || profile.userId !== ctx.user._id) {
      throw new ConvexError('Profile not found or access denied')
    }

    const currentAttributes = (profile.attributes || {}) as Record<
      string,
      unknown
    >
    const mergedAttributes = {
      ...currentAttributes,
      ...attributes
    } as any

    await ctx.db.patch(ctx.user.activeDancerId, {
      attributes: mergedAttributes
    })

    return null
  }
})

// Update a specific sizing field on the active dancer profile
export const updateDancerSizingField = zAuthMutation({
  args: { section: z.string(), field: z.string(), value: z.string() },
  returns: z.null(),
  handler: async (ctx, { section, field, value }) => {
    if (!ctx.user.activeDancerId) {
      throw new ConvexError('No active dancer profile found')
    }

    const profile = await ctx.db.get(ctx.user.activeDancerId)
    if (!profile || profile.userId !== ctx.user._id) {
      throw new ConvexError('Profile not found or access denied')
    }

    const currentSizing = (profile.sizing || {}) as Record<string, any>
    const currentSection = (currentSizing[section] || {}) as Record<string, any>
    const updatedSection = {
      ...currentSection,
      [field]: value
    }
    const newSizing = {
      ...currentSizing,
      [section]: updatedSection
    }

    await ctx.db.patch(ctx.user.activeDancerId, { sizing: newSizing })

    return null
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

    // Use flattened resume fields (with fallback to nested resume for backward compatibility)
    const projects = profile.projects || profile.resume?.projects
    if (projects && Array.isArray(projects) && projects.length > 0)
      score += weights.resume

    const skills = profile.skills || profile.resume?.skills
    if (skills && Array.isArray(skills) && skills.length > 0)
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

// Add a dancer to favorites
export const addFavoriteDancer = zAuthMutation({
  args: { dancerId: zid('dancers') },
  returns: z.null(),
  handler: async (ctx, { dancerId }) => {
    if (!ctx.user.activeDancerId) {
      throw new ConvexError('No active dancer profile found')
    }

    const profile = await ctx.db.get(ctx.user.activeDancerId)
    if (!profile || profile.userId !== ctx.user._id) {
      throw new ConvexError('Profile not found or access denied')
    }

    const existing = profile.favoriteDancers || []
    if (existing.includes(dancerId)) {
      return null // Already favorited
    }

    await ctx.db.patch(ctx.user.activeDancerId, {
      favoriteDancers: [...existing, dancerId]
    })
    return null
  }
})

// Remove a dancer from favorites
export const removeFavoriteDancer = zAuthMutation({
  args: { dancerId: zid('dancers') },
  returns: z.null(),
  handler: async (ctx, { dancerId }) => {
    if (!ctx.user.activeDancerId) {
      throw new ConvexError('No active dancer profile found')
    }

    const profile = await ctx.db.get(ctx.user.activeDancerId)
    if (!profile || profile.userId !== ctx.user._id) {
      throw new ConvexError('Profile not found or access denied')
    }

    const existing = profile.favoriteDancers || []
    await ctx.db.patch(ctx.user.activeDancerId, {
      favoriteDancers: existing.filter((id) => id !== dancerId)
    })
    return null
  }
})

// Add a choreographer to favorites
export const addFavoriteChoreographer = zAuthMutation({
  args: { choreographerId: zid('choreographers') },
  returns: z.null(),
  handler: async (ctx, { choreographerId }) => {
    if (!ctx.user.activeDancerId) {
      throw new ConvexError('No active dancer profile found')
    }

    const profile = await ctx.db.get(ctx.user.activeDancerId)
    if (!profile || profile.userId !== ctx.user._id) {
      throw new ConvexError('Profile not found or access denied')
    }

    const existing = profile.favoriteChoreographers || []
    if (existing.includes(choreographerId)) {
      return null // Already favorited
    }

    await ctx.db.patch(ctx.user.activeDancerId, {
      favoriteChoreographers: [...existing, choreographerId]
    })
    return null
  }
})

// Remove a choreographer from favorites
export const removeFavoriteChoreographer = zAuthMutation({
  args: { choreographerId: zid('choreographers') },
  returns: z.null(),
  handler: async (ctx, { choreographerId }) => {
    if (!ctx.user.activeDancerId) {
      throw new ConvexError('No active dancer profile found')
    }

    const profile = await ctx.db.get(ctx.user.activeDancerId)
    if (!profile || profile.userId !== ctx.user._id) {
      throw new ConvexError('Profile not found or access denied')
    }

    const existing = profile.favoriteChoreographers || []
    await ctx.db.patch(ctx.user.activeDancerId, {
      favoriteChoreographers: existing.filter((id) => id !== choreographerId)
    })
    return null
  }
})

// Helper function to generate search pattern
function generateSearchPattern(data: any): string {
  const parts = []

  // Add basic info if available
  if (data.attributes?.ethnicity) parts.push(data.attributes.ethnicity)
  if (data.attributes?.gender) parts.push(data.attributes.gender)
  if (data.attributes?.hairColor) parts.push(data.attributes.hairColor)

  // Add skills (use flattened fields with fallback to nested resume)
  const skills = data.skills || data.resume?.skills
  if (skills) parts.push(...skills)

  const genres = data.genres || data.resume?.genres
  if (genres) parts.push(...genres)

  // Add location
  if (data.location?.city) parts.push(data.location.city)
  if (data.location?.state) parts.push(data.location.state)

  // Add dance styles (future field)
  if (data.danceStyles) parts.push(...data.danceStyles)

  return parts.filter(Boolean).join(' ').toLowerCase()
}
