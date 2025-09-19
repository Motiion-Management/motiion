import { authMutation, authQuery, notEmpty } from '../util'
import { query } from '../_generated/server'
import { zQuery, zMutation } from 'zodvex'
import { z } from 'zod'
import { zid } from 'zodvex'
import { zProjects, zProjectsDoc } from '../schemas/projects'

// Create a new project for the authenticated user
const zProjectInput = zProjects.omit({
  userId: true,
  profileType: true,
  profileId: true
})

export const addMyProject = zMutation(
  authMutation,
  zProjectInput,
  async (ctx, project) => {
    // Add profile references if user has an active profile
    let profileInfo = {}
    let profile = null

    if (
      ctx.user.activeProfileType &&
      (ctx.user.activeDancerId || ctx.user.activeChoreographerId)
    ) {
      if (ctx.user.activeProfileType === 'dancer' && ctx.user.activeDancerId) {
        profile = await ctx.db.get(ctx.user.activeDancerId)
        profileInfo = {
          profileType: 'dancer' as const,
          profileId: ctx.user.activeDancerId
        }
      } else if (
        ctx.user.activeProfileType === 'choreographer' &&
        ctx.user.activeChoreographerId
      ) {
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
      const updatedResume = {
        ...profile.resume,
        projects: [...(profile.resume?.projects || []), projId]
      }
      await ctx.db.patch(profile._id, {
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
  },
  { returns: zid('projects') }
)

// Remove a project that belongs to the authenticated user
export const removeMyProject = zMutation(
  authMutation,
  { projectId: zid('projects') },
  async (ctx, args) => {
    const doc = await ctx.db.get(args.projectId)
    if (!doc || doc.userId !== ctx.user._id) {
      // Not found or not owned by user; do nothing
      return null
    }

    // Get profile if active
    let profile = null
    if (
      ctx.user.activeProfileType &&
      (ctx.user.activeDancerId || ctx.user.activeChoreographerId)
    ) {
      if (ctx.user.activeProfileType === 'dancer' && ctx.user.activeDancerId) {
        profile = await ctx.db.get(ctx.user.activeDancerId)
      } else if (
        ctx.user.activeProfileType === 'choreographer' &&
        ctx.user.activeChoreographerId
      ) {
        profile = await ctx.db.get(ctx.user.activeChoreographerId)
      }
    }

    // Detach from resume list in profile or user
    if (profile) {
      const updatedResume = {
        ...profile.resume,
        projects: (profile.resume?.projects || []).filter(
          (id: import('../_generated/dataModel').Id<'projects'>) =>
            id !== args.projectId
        )
      }
      await ctx.db.patch(profile._id, {
        resume: updatedResume
      })
    } else {
      const updatedResume = {
        ...ctx.user.resume,
        projects: (ctx.user.resume?.projects || []).filter(
          (id: import('../_generated/dataModel').Id<'projects'>) =>
            id !== args.projectId
        )
      }
      await ctx.db.patch(ctx.user._id, {
        resume: updatedResume
      })
    }

    await ctx.db.delete(args.projectId)
    return null
  },
  { returns: z.null() }
)

// List my projects from the unified table via index
export const getMyProjects = zQuery(
  authQuery,
  {},
  async (ctx) => {
    if (!ctx.user) return []
    const projs = await ctx.db
      .query('projects')
      .withIndex('userId', (q) => q.eq('userId', ctx.user._id))
      .collect()
    const sorted = projs.filter(notEmpty).sort((a, b) => {
      if (!a.startDate || !b.startDate) return 0
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    })
    return sorted as z.infer<typeof zProjectsDoc>[]
  },
  { returns: z.array(zProjectsDoc) }
)

export const getMyProjectsByType = zQuery(
  authQuery,
  {
    type: z.enum(['tv-film', 'music-video', 'live-performance', 'commercial'])
  },
  async (ctx, args) => {
    if (!ctx.user) return []
    const projs = await ctx.db
      .query('projects')
      .withIndex('userId', (q) => q.eq('userId', ctx.user._id))
      .collect()
    const filtered = projs
      .filter(notEmpty)
      .filter((p) => p.type === args.type)
      .sort((a, b) => {
        if (!a.startDate || !b.startDate) return 0
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      })
    return filtered as z.infer<typeof zProjectsDoc>[]
  },
  { returns: z.array(zProjectsDoc) }
)

// Public projects for a given user from unified table
export const getUserPublicProjects = zQuery(
  query,
  { userId: zid('users') },
  async (ctx, args) => {
    const projs = await ctx.db
      .query('projects')
      .withIndex('userId', (q) => q.eq('userId', args.userId))
      .collect()
    const filtered = projs
      .filter((p) => !p?.private)
      .sort((a, b) => {
        if (!a.startDate || !b.startDate) return 0
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      })
    return filtered as z.infer<typeof zProjectsDoc>[]
  },
  { returns: z.array(zProjectsDoc) }
)

export const getUserPublicProjectsByType = zQuery(
  query,
  {
    userId: zid('users'),
    type: z.enum(['tv-film', 'music-video', 'live-performance', 'commercial'])
  },
  async (ctx, args) => {
    const projs = await ctx.db
      .query('projects')
      .withIndex('userId', (q) => q.eq('userId', args.userId))
      .collect()
    const filtered = projs
      .filter((p) => p.type === args.type)
      .filter((p) => !p?.private)
      .sort((a, b) => {
        if (!a.startDate || !b.startDate) return 0
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      })
    return filtered as z.infer<typeof zProjectsDoc>[]
  },
  { returns: z.array(zProjectsDoc) }
)

// Get the 3 most recently added projects for the authenticated user
export const getMyRecentProjects = zQuery(
  authQuery,
  {},
  async (ctx) => {
    if (!ctx.user) return []
    const projs = await ctx.db
      .query('projects')
      .withIndex('userId', (q) => q.eq('userId', ctx.user._id))
      .order('desc')
      .take(3)
    return projs.filter(notEmpty) as z.infer<typeof zProjectsDoc>[]
  },
  { returns: z.array(zProjectsDoc) }
)
