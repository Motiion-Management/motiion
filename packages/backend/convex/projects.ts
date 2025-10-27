import { zq, authMutation, authQuery, zid, getUserOrThrow } from './util'
import * as ConvexBase from './_generated/server'
import { z } from 'zod'
import { DataModel, Doc } from './_generated/dataModel'
import { ConvexError } from 'convex/values'

// Import schema from schemas folder
import {
  Projects,
  projects,
  ProjectFormDoc,
  zProjectsDoc,
  zProjectsClientDoc,
  PROJECT_TYPES
} from './schemas/projects'

const zProjectDoc = Projects.zDoc

import { Triggers } from 'convex-helpers/server/triggers'

import {
  Rules,
  wrapDatabaseReader,
  wrapDatabaseWriter
} from 'convex-helpers/server/rowLevelSecurity'
import { customCtx, zCustomMutationBuilder, zCustomQueryBuilder } from 'zodvex'

// convex helpers trigger
export const triggers = new Triggers<DataModel>()

// convex helpers rls config
async function rlsRules(ctx: ConvexBase.QueryCtx) {
  const user = await getUserOrThrow(ctx)
  return {
    rules: {} satisfies Rules<ConvexBase.QueryCtx, DataModel>,
    user
  }
}

// custom function
export const protectedQuery = zCustomQueryBuilder(
  ConvexBase.query,
  customCtx(async (ctx) => {
    const { rules, user } = await rlsRules(ctx)
    return {
      db: wrapDatabaseReader(ctx, ctx.db, rules),
      user
    }
  })
)

// Works. I get the correct type
export type ProtectedQueryCtx = CustomCtx<typeof protectedQuery>

// custom function wrapped with the triggers and rls config
export const protectedMutation = zCustomMutationBuilder(
  ConvexBase.mutation,
  customCtx(async (ctx) => {
    const withTriggersCtx = triggers.wrapDB(ctx)
    const { rules, user } = await rlsRules(withTriggersCtx)
    return {
      ...withTriggersCtx,
      db: wrapDatabaseWriter(withTriggersCtx, withTriggersCtx.db, rules),
      user
    }
  })
)

// Helper to extract the convex ctx type from the custom functions
type CustomCtx<T> = T extends (config: infer Config) => any
  ? Config extends { handler: (ctx: infer Ctx, ...args: any[]) => any }
    ? Ctx
    : never
  : never

// becomes any
export type ProtectedMutationCtx = CustomCtx<typeof protectedMutation>

// Public read
export const read = zq({
  args: { id: zid('projects') },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id)
  }
})

// Authenticated create
export const create = authMutation({
  args: projects,
  returns: zid('projects'),
  handler: async (ctx, args) => {
    return await ctx.db.insert('projects', args)
  }
})

// Authenticated update
export const update = authMutation({
  args: {
    id: zid('projects'),
    patch: z.any()
  },
  returns: z.null(),
  handler: async (ctx, { id, patch }) => {
    await ctx.db.patch(id, patch)
    return null
  }
})

// Authenticated destroy
export const destroy = authMutation({
  args: { id: zid('projects') },
  returns: z.null(),
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id)
    return null
  }
})

// Get all projects for current user's active profile
export const getMyProjects = authQuery({
  args: {},
  returns: z.array(zProjectsClientDoc),
  handler: async (ctx) => {
    if (!ctx.user) return []

    const projects = await ctx.db
      .query('projects')
      .withIndex('userId', (q) => q.eq('userId', ctx.user._id))
      .collect()

    return projects.map(({ userId, profileType, profileId, ...rest }) => rest)
  }
})

// Get recent projects for current user (last 5)
export const getMyRecentProjects = authQuery({
  args: {},
  returns: z.array(zProjectsClientDoc),
  handler: async (ctx) => {
    if (!ctx.user) return []

    const projects = await ctx.db
      .query('projects')
      .withIndex('userId', (q) => q.eq('userId', ctx.user._id))
      .order('desc')
      .take(5)

    return projects.map(({ userId, profileType, profileId, ...rest }) => rest)
  }
})

// Add project with automatic profile info
export const addMyProject = authMutation({
  args: z.object(projects).partial().extend({
    title: z.string(),
    projectType: z.string()
  }),
  returns: zid('projects'),
  handler: async (ctx, args) => {
    // Get profile info
    let profileInfo: any = {}

    if (
      ctx.user.activeProfileType &&
      (ctx.user.activeDancerId || ctx.user.activeChoreographerId)
    ) {
      if (ctx.user.activeProfileType === 'dancer' && ctx.user.activeDancerId) {
        profileInfo = {
          profileType: 'dancer' as const,
          profileId: ctx.user.activeDancerId
        }
      } else if (
        ctx.user.activeProfileType === 'choreographer' &&
        ctx.user.activeChoreographerId
      ) {
        profileInfo = {
          profileType: 'choreographer' as const,
          profileId: ctx.user.activeChoreographerId
        }
      }
    }

    return await ctx.db.insert('projects', {
      ...args,
      userId: ctx.user._id,
      ...profileInfo
    } as any)
  }
})

// Get projects for a specific dancer profile, optionally filtered by type
export const getDancerProjectsByType = zq({
  args: {
    dancerId: zid('dancers'),
    type: z.enum(PROJECT_TYPES).optional()
  },
  returns: z.array(Projects.zDoc),
  handler: async (ctx, { dancerId, type }) => {
    let query = ctx.db
      .query('projects')
      .withIndex('by_profileId', (q) => q.eq('profileId', dancerId))
      .order('desc')

    const allProjects = await query.collect()

    // Filter by type if provided
    if (type) {
      return allProjects.filter((project) => project.type === type)
    }

    return allProjects
  }
})
