import { authMutation, authQuery, notEmpty, zq } from '../util'
import { query } from '../_generated/server'
import { z } from 'zod'
import { zid } from '@packages/zodvex'
import { Projects } from '../schemas/projects'

// Create a new project for the authenticated user
export const addMyProject = authMutation({
  args: z.object({ project: z.any() }),
  returns: zid('projects'),
  handler: async (ctx, { project }) => {
    // Add profile references if user has an active profile
    let profileInfo = {}
    let profile = null

    if (ctx.user.activeProfileType && (ctx.user.activeDancerId || ctx.user.activeChoreographerId)) {
      if (ctx.user.activeProfileType === 'dancer' && ctx.user.activeDancerId) {
        profile = await ctx.db.get(ctx.user.activeDancerId)
        profileInfo = {
          profileType: 'dancer' as const,
          profileId: ctx.user.activeDancerId
        }
      } else if (ctx.user.activeProfileType === 'choreographer' && ctx.user.activeChoreographerId) {
        profile = await ctx.db.get(ctx.user.activeChoreographerId)
        profileInfo = {
          profileType: 'choreographer' as const,
          profileId: ctx.user.activeChoreographerId
        }
      }
    }

    const payload = {
      ...(project || {}),
      userId: ctx.user._id,
      ...profileInfo
    }
    const projId = await ctx.db.insert('projects', payload)

    // Update resume.projects list in profile or user
    if (profile) {
      const resume: any = profile.resume || {}
      const updatedResume = {
        ...resume,
        projects: [...(resume.projects || []), projId]
      }
      await ctx.db.patch(profile._id as any, {
        resume: updatedResume
      })
    } else {
      const updatedResume = {
        ...ctx.user.resume,
        projects: [...(ctx.user.resume?.projects || []), projId]
      }
      await ctx.db.patch(ctx.user._id, {
        resume: updatedResume
      })
    }

    return projId
  }
})

// Remove a project that belongs to the authenticated user
export const removeMyProject = authMutation({
  args: { projectId: zid('projects') },
  returns: z.null(),
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.projectId)
    if (!doc || doc.userId !== ctx.user._id) {
      // Not found or not owned by user; do nothing
      return null
    }

    // Get profile if active
    let profile = null
    if (ctx.user.activeProfileType && (ctx.user.activeDancerId || ctx.user.activeChoreographerId)) {
      if (ctx.user.activeProfileType === 'dancer' && ctx.user.activeDancerId) {
        profile = await ctx.db.get(ctx.user.activeDancerId)
      } else if (ctx.user.activeProfileType === 'choreographer' && ctx.user.activeChoreographerId) {
        profile = await ctx.db.get(ctx.user.activeChoreographerId)
      }
    }

    // Detach from resume list in profile or user
    if (profile) {
      const resume: any = profile.resume || {}
      const projects: any = resume.projects || []
      const updatedResume = {
        ...resume,
        projects: projects.filter(
          (id: import('../_generated/dataModel').Id<'projects'>) => id !== args.projectId
        )
      }
      await ctx.db.patch(profile._id as any, {
        resume: updatedResume
      })
    } else {
      const updatedResume = {
        ...ctx.user.resume,
        projects: (ctx.user.resume?.projects || []).filter(
          (id: import('../_generated/dataModel').Id<'projects'>) => id !== args.projectId
        )
      }
      await ctx.db.patch(ctx.user._id, {
        resume: updatedResume
      })
    }

    await ctx.db.delete(args.projectId)
    return null
  }
})

// List my projects from the unified table via index
export const getMyProjects = authQuery({
  returns: z.array(Projects.zDoc),
  handler: async (ctx) => {
    if (!ctx.user) return []
    const projs = await ctx.db
      .query('projects')
      .withIndex('userId', (q) => q.eq('userId', ctx.user._id))
      .collect()
    return projs.filter(notEmpty).sort((a, b) => {
      const aDate = a.startDate ? new Date(a.startDate as any).getTime() : 0
      const bDate = b.startDate ? new Date(b.startDate as any).getTime() : 0
      return bDate - aDate
    })
  }
})

export const getMyProjectsByType = authQuery({
  args: {
    type: z.enum([
      'tv-film',
      'music-video',
      'live-performance',
      'commercial'
    ])
  },
  returns: z.array(Projects.zDoc),
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
        const aDate = a.startDate ? new Date(a.startDate as any).getTime() : 0
        const bDate = b.startDate ? new Date(b.startDate as any).getTime() : 0
        return bDate - aDate
      })
  }
})

// Public projects for a given user from unified table
export const getUserPublicProjects = zq({
  args: { userId: zid('users') },
  returns: z.array(Projects.zDoc),
  handler: async (ctx, args) => {
    const projs = await ctx.db
      .query('projects')
      .withIndex('userId', (q) => q.eq('userId', args.userId))
      .collect()
    return projs
      .filter((p) => !p?.private)
      .sort((a, b) => {
        const aDate = a.startDate ? new Date(a.startDate as any).getTime() : 0
        const bDate = b.startDate ? new Date(b.startDate as any).getTime() : 0
        return bDate - aDate
      })
  }
})

export const getUserPublicProjectsByType = zq({
  args: {
    userId: zid('users'),
    type: z.enum([
      'tv-film',
      'music-video',
      'live-performance',
      'commercial'
    ])
  },
  returns: z.array(Projects.zDoc),
  handler: async (ctx, args) => {
    const projs = await ctx.db
      .query('projects')
      .withIndex('userId', (q) => q.eq('userId', args.userId))
      .collect()
    return projs
      .filter((p) => p.type === args.type)
      .filter((p) => !p?.private)
      .sort((a, b) => {
        const aDate = a.startDate ? new Date(a.startDate as any).getTime() : 0
        const bDate = b.startDate ? new Date(b.startDate as any).getTime() : 0
        return bDate - aDate
      })
  }
})

// Get the 3 most recently added projects for the authenticated user
export const getMyRecentProjects = authQuery({
  returns: z.array(Projects.zDoc),
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
