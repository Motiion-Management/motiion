import { ConvexError } from 'convex/values'
import { authQuery, authMutation, zid } from './util'
import { z } from 'zod'

const MAX_HIGHLIGHTS = 10

/**
 * Get current user's highlights with project data
 */
export const getMyHighlights = authQuery({
  args: {},
  handler: async (ctx) => {
    const user = ctx.user

    // Get user's active dancer profile
    if (!user || !user.activeDancerId) {
      return []
    }

    const profileId = user.activeDancerId

    // Fetch highlights sorted by position
    const highlights = await ctx.db
      .query('highlights')
      .withIndex('by_profileId', (q) => q.eq('profileId', profileId))
      .collect()

    // Sort by position
    const sortedHighlights = highlights.sort((a, b) => a.position - b.position)

    // Fetch project data and image URLs for each highlight
    const highlightsWithData = await Promise.all(
      sortedHighlights.map(async (highlight) => {
        const project = await ctx.db.get(highlight.projectId)
        const imageUrl = await ctx.storage.getUrl(highlight.imageId)

        return {
          ...highlight,
          project: project
            ? {
                _id: project._id,
                title: project.title,
                studio: project.studio,
                artists: project.artists,
                tourArtist: project.tourArtist,
                companyName: project.companyName,
                type: project.type
              }
            : null,
          imageUrl
        }
      })
    )

    return highlightsWithData
  }
})

/**
 * Add a new highlight
 */
export const addHighlight = authMutation({
  args: {
    profileId: zid('dancers'),
    projectId: zid('projects'),
    imageId: zid('_storage')
  },
  handler: async (ctx, args) => {
    const user = ctx.user

    // Verify profile belongs to user
    const profile = await ctx.db.get(args.profileId)
    if (!profile || profile.userId !== user._id) {
      throw new ConvexError('Profile not found or unauthorized')
    }

    // Verify project belongs to user
    const project = await ctx.db.get(args.projectId)
    if (!project || project.userId !== user._id) {
      throw new ConvexError('Project not found or unauthorized')
    }

    // Check max highlights limit
    const existingHighlights = await ctx.db
      .query('highlights')
      .withIndex('by_profileId', (q) => q.eq('profileId', args.profileId))
      .collect()

    if (existingHighlights.length >= MAX_HIGHLIGHTS) {
      throw new ConvexError(
        `Maximum of ${MAX_HIGHLIGHTS} highlights allowed. Remove one to add another.`
      )
    }

    // Calculate next position
    const nextPosition =
      existingHighlights.length > 0
        ? Math.max(...existingHighlights.map((h) => h.position)) + 1
        : 0

    // Create highlight
    const highlightId = await ctx.db.insert('highlights', {
      userId: user._id,
      profileId: args.profileId,
      projectId: args.projectId,
      imageId: args.imageId,
      position: nextPosition,
      createdAt: new Date().toISOString()
    })

    return highlightId
  }
})

/**
 * Remove a highlight
 */
export const removeHighlight = authMutation({
  args: {
    highlightId: zid('highlights')
  },
  handler: async (ctx, args) => {
    const user = ctx.user

    // Verify highlight belongs to user
    const highlight = await ctx.db.get(args.highlightId)
    if (!highlight || highlight.userId !== user._id) {
      throw new ConvexError('Highlight not found or unauthorized')
    }

    // Delete the highlight
    await ctx.db.delete(args.highlightId)

    // Reorder remaining highlights to fill the gap
    const remainingHighlights = await ctx.db
      .query('highlights')
      .withIndex('by_profileId', (q) => q.eq('profileId', highlight.profileId))
      .collect()

    const sorted = remainingHighlights.sort((a, b) => a.position - b.position)

    // Update positions to be sequential
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].position !== i) {
        await ctx.db.patch(sorted[i]._id, { position: i })
      }
    }

    return null
  }
})

/**
 * Reorder highlights after drag and drop
 */
export const reorderHighlights = authMutation({
  args: {
    profileId: zid('dancers'),
    highlightIds: z.array(zid('highlights')) // New order of highlight IDs
  },
  handler: async (ctx, args) => {
    const user = ctx.user

    // Verify profile belongs to user
    const profile = await ctx.db.get(args.profileId)
    if (!profile || profile.userId !== user._id) {
      throw new ConvexError('Profile not found or unauthorized')
    }

    // Update each highlight's position based on array index
    for (let i = 0; i < args.highlightIds.length; i++) {
      const highlightId = args.highlightIds[i]
      const highlight = await ctx.db.get(highlightId)

      // Verify highlight belongs to this profile
      if (!highlight || highlight.profileId !== args.profileId) {
        throw new ConvexError('Highlight not found or unauthorized')
      }

      // Update position
      await ctx.db.patch(highlightId, { position: i })
    }

    return null
  }
})
