import { authMutation, authQuery, notEmpty } from '../util'
import { v } from 'convex/values'
import { query } from '../_generated/server'

// Create a new project for the authenticated user
export const addMyProject = authMutation({
  args: v.any(),
  returns: v.id('projects'),
  handler: async (ctx, project) => {
    const payload = { ...(project || {}), userId: ctx.user._id } as any
    const projId = await ctx.db.insert('projects', payload)
    // Keep resume.projects list in sync
    await ctx.db.patch(ctx.user._id, {
      resume: {
        ...ctx.user.resume,
        projects: [...(ctx.user?.resume?.projects || []), projId]
      }
    })
    return projId
  }
})

// Remove a project that belongs to the authenticated user
export const removeMyProject = authMutation({
  args: { projectId: v.id('projects') },
  returns: v.null(),
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.projectId)
    if (!doc || doc.userId !== ctx.user._id) {
      // Not found or not owned by user; do nothing
      return null
    }
    // Detach from resume list
    await ctx.db.patch(ctx.user._id, {
      resume: {
        ...ctx.user.resume,
        projects: (ctx.user.resume?.projects || []).filter(
          (id: import('../_generated/dataModel').Id<'projects'>) => id !== args.projectId
        )
      }
    })
    await ctx.db.delete(args.projectId)
    return null
  }
})

// List my projects from the unified table via index
export const getMyProjects = authQuery({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    if (!ctx.user) return []
    const projs = await ctx.db
      .query('projects')
      .withIndex('userId', (q) => q.eq('userId', ctx.user._id))
      .collect()
    return projs.filter(notEmpty).sort((a, b) => {
      if (!a.startDate || !b.startDate) return 0
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    })
  }
})

export const getMyProjectsByType = authQuery({
  args: {
    type: v.union(
      v.literal('tv-film'),
      v.literal('music-video'),
      v.literal('live-performance'),
      v.literal('commercial')
    )
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    if (!ctx.user) return []
    const projs = await ctx.db
      .query('projects')
      .withIndex('userId', (q) => q.eq('userId', ctx.user._id))
      .collect()
    return projs
      .filter(notEmpty)
      .filter((p) => p.type === args.type)
      .sort((a, b) => {
        if (!a.startDate || !b.startDate) return 0
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      })
  }
})

// Public projects for a given user from unified table
export const getUserPublicProjects = query({
  args: { userId: v.id('users') },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const projs = await ctx.db
      .query('projects')
      .withIndex('userId', (q) => q.eq('userId', args.userId))
      .collect()
    return projs
      .filter((p) => !p?.private)
      .sort((a, b) => {
        if (!a.startDate || !b.startDate) return 0
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      })
  }
})

export const getUserPublicProjectsByType = query({
  args: {
    userId: v.id('users'),
    type: v.union(
      v.literal('tv-film'),
      v.literal('music-video'),
      v.literal('live-performance'),
      v.literal('commercial')
    )
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const projs = await ctx.db
      .query('projects')
      .withIndex('userId', (q) => q.eq('userId', args.userId))
      .collect()
    return projs
      .filter((p) => p.type === args.type)
      .filter((p) => !p?.private)
      .sort((a, b) => {
        if (!a.startDate || !b.startDate) return 0
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      })
  }
})

// Get the 3 most recently added projects for the authenticated user
export const getMyRecentProjects = authQuery({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    if (!ctx.user) return []
    const projs = await ctx.db
      .query('projects')
      .withIndex('userId', (q) => q.eq('userId', ctx.user._id))
      .order('desc')
      .take(3)
    return projs.filter(notEmpty)
  }
})

// Backwards compatibility exports (redirect to new names)
export const addMyExperience = addMyProject
export const removeMyExperience = removeMyProject
export const getMyExperiences = getMyProjects
export const getMyExperiencesByType = getMyProjectsByType
export const getUserPublicExperiences = getUserPublicProjects
export const getUserPublicExperiencesByType = getUserPublicProjectsByType
export const getMyRecentExperiences = getMyRecentProjects
