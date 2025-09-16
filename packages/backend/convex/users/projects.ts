import { authMutation, authQuery, notEmpty } from '../util'
import { query } from '../_generated/server'
import { zQuery, zMutation } from '@packages/zodvex'
import { z } from 'zod'
import { zid } from 'convex-helpers/server/zodV4'

// Create a new project for the authenticated user
export const addMyProject = zMutation(
  authMutation,
  z.any(),
  async (ctx, project) => {
    const payload = { ...(project || {}), userId: ctx.user._id }
    const projId = await ctx.db.insert('projects', payload)
    // Keep resume.projects list in sync
    await ctx.db.patch(ctx.user._id, {
      resume: {
        ...ctx.user.resume,
        projects: [...(ctx.user?.resume?.projects || []), projId]
      }
    })
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
    return projs.filter(notEmpty).sort((a, b) => {
      if (!a.startDate || !b.startDate) return 0
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    })
  },
  { returns: z.array(z.any()) }
)

export const getMyProjectsByType = zQuery(
  authQuery,
  {
    type: z.enum([
      'tv-film',
      'music-video',
      'live-performance',
      'commercial'
    ])
  },
  async (ctx, args) => {
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
  },
  { returns: z.array(z.any()) }
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
    return projs
      .filter((p) => !p?.private)
      .sort((a, b) => {
        if (!a.startDate || !b.startDate) return 0
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      })
  },
  { returns: z.array(z.any()) }
)

export const getUserPublicProjectsByType = zQuery(
  query,
  {
    userId: zid('users'),
    type: z.enum([
      'tv-film',
      'music-video',
      'live-performance',
      'commercial'
    ])
  },
  async (ctx, args) => {
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
  },
  { returns: z.array(z.any()) }
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
    return projs.filter(notEmpty)
  },
  { returns: z.array(z.any()) }
)

