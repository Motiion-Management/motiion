import { authMutation, authQuery, notEmpty } from '../util'
import { v } from 'convex/values'
import { query } from '../_generated/server'

// Create a new experience for the authenticated user
export const addMyExperience = authMutation({
  args: v.any(),
  returns: v.id('experiences'),
  handler: async (ctx, experience) => {
    const payload = { ...(experience || {}), userId: ctx.user._id } as any
    const expId = await ctx.db.insert('experiences', payload)
    // Keep legacy resume.experiences list in sync (dev only, no migration yet)
    await ctx.db.patch(ctx.user._id, {
      resume: {
        ...ctx.user.resume,
        experiences: [...(ctx.user?.resume?.experiences || []), expId]
      }
    })
    return expId
  }
})

// Remove an experience that belongs to the authenticated user
export const removeMyExperience = authMutation({
  args: { experienceId: v.id('experiences') },
  returns: v.null(),
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.experienceId)
    if (!doc || doc.userId !== ctx.user._id) {
      // Not found or not owned by user; do nothing
      return null
    }
    // Detach from legacy resume list
    await ctx.db.patch(ctx.user._id, {
      resume: {
        ...ctx.user.resume,
        experiences: (ctx.user.resume?.experiences || []).filter(
          (id) => id !== args.experienceId
        )
      }
    })
    await ctx.db.delete(args.experienceId)
    return null
  }
})

// List my experiences from the unified table via index
export const getMyExperiences = authQuery({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const exps = await ctx.db
      .query('experiences')
      .withIndex('userId', (q) => q.eq('userId', ctx.user._id))
      .collect()
    return exps.filter(notEmpty).sort((a, b) => {
      if (!a.startDate || !b.startDate) return 0
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    })
  }
})

export const getMyExperiencesByType = authQuery({
  args: { type: v.union(v.literal('tv-film'), v.literal('music-video'), v.literal('live-performance'), v.literal('commercial')) },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const exps = await ctx.db
      .query('experiences')
      .withIndex('userId', (q) => q.eq('userId', ctx.user._id))
      .collect()
    return exps
      .filter(notEmpty)
      .filter((e) => e.type === args.type)
      .sort((a, b) => {
        if (!a.startDate || !b.startDate) return 0
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      })
  }
})

// Public experiences for a given user from unified table
export const getUserPublicExperiences = query({
  args: { userId: v.id('users') },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const exps = await ctx.db
      .query('experiences')
      .withIndex('userId', (q) => q.eq('userId', args.userId))
      .collect()
    return exps
      .filter((e) => !e?.private)
      .sort((a, b) => {
        if (!a.startDate || !b.startDate) return 0
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      })
  }
})

export const getUserPublicExperiencesByType = query({
  args: { userId: v.id('users'), type: v.union(v.literal('tv-film'), v.literal('music-video'), v.literal('live-performance'), v.literal('commercial')) },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const exps = await ctx.db
      .query('experiences')
      .withIndex('userId', (q) => q.eq('userId', args.userId))
      .collect()
    return exps
      .filter((e) => e.type === args.type)
      .filter((e) => !e?.private)
      .sort((a, b) => {
        if (!a.startDate || !b.startDate) return 0
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      })
  }
})
