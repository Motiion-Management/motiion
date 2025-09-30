import { query, mutation, internalMutation } from './_generated/server'
import { ConvexError } from 'convex/values'
import { z } from 'zod'
import { zid } from '@packages/zodvex'
import { authMutation, authQuery, zim, zq, zm } from './util'
import { Choreographers, zCreateChoreographerInput, zChoreographers, ChoreographerDoc } from './schemas/choreographers'
import { zodDoc, zodDocOrNull } from '@packages/zodvex'

const zChoreographerDoc = zodDoc('choreographers', zChoreographers)
const zChoreographerDocOrNull = zodDocOrNull('choreographers', zChoreographers)

// Get the active choreographer profile for the authenticated user
export const getMyChoreographerProfile = authQuery({
  returns: zChoreographerDocOrNull,
  handler: async (ctx) => {
    if (!ctx.user) return null

    // Use discriminate value from users table for efficient lookup
    if (ctx.user.activeProfileType === 'choreographer' && ctx.user.activeChoreographerId) {
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
export const updateChoreographerProfile = zm({
  args: {},
  handler: async (ctx, args) => {
    // TODO: Implement update logic
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