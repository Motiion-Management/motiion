import { authMutation, authQuery, notEmpty } from './util'
import { Training, trainingInput, zTrainingInput, zTrainingFormDoc } from './schemas/training'
import { getAll } from 'convex-helpers/server/relationships'
import { query } from './_generated/server'
import { zCrud, zMutation, zQuery } from '@packages/zodvex'
import { z } from 'zod'
import { zid } from '@packages/zodvex'

// Basic CRUD operations
export const { read } = zCrud(Training, query, authMutation)
export const { create, update, destroy } = zCrud(
  Training,
  authQuery,
  authMutation
)

// Add training to user
export const addMyTraining = zMutation(
  authMutation,
  trainingInput,
  async (ctx, training) => {
    // Get profile if active
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

    // Get current max order index
    const existingTraining = await ctx.db
      .query('training')
      .withIndex('by_userId', (q) => q.eq('userId', ctx.user._id))
      .collect()

    const maxOrderIndex = Math.max(
      0,
      ...existingTraining.map((t) => (t.orderIndex as number) || 0)
    )

    const insertData: any = {
      ...training,
      userId: ctx.user._id,
      ...profileInfo,
      orderIndex: maxOrderIndex + 1
    }
    const trainingId = await ctx.db.insert('training', insertData)

    // Update training list in profile or user
    if (profile) {
      const profileTraining: any = Array.isArray(profile.training) ? profile.training : []
      await ctx.db.patch(profile._id as any, {
        training: [...profileTraining, trainingId]
      })
    } else {
      const userTraining: any = Array.isArray(ctx.user?.training) ? ctx.user.training : []
      await ctx.db.patch(ctx.user._id, {
        training: [...userTraining, trainingId]
      })
    }

    return null
  },
  { returns: z.null() }
)

// Remove training from user
export const removeMyTraining = zMutation(
  authMutation,
  { trainingId: zid('training') },
  async (ctx, args) => {
    // Get profile if active
    let profile = null
    if (ctx.user.activeProfileType && (ctx.user.activeDancerId || ctx.user.activeChoreographerId)) {
      if (ctx.user.activeProfileType === 'dancer' && ctx.user.activeDancerId) {
        profile = await ctx.db.get(ctx.user.activeDancerId)
      } else if (ctx.user.activeProfileType === 'choreographer' && ctx.user.activeChoreographerId) {
        profile = await ctx.db.get(ctx.user.activeChoreographerId)
      }
    }

    // Remove from training list in profile or user
    if (profile) {
      const profileTraining: any = Array.isArray(profile.training) ? profile.training : []
      await ctx.db.patch(profile._id as any, {
        training: profileTraining.filter(
          (id: import('./_generated/dataModel').Id<'training'>) => id !== args.trainingId
        )
      })
    } else {
      const userTraining: any = Array.isArray(ctx.user.training) ? ctx.user.training : []
      await ctx.db.patch(ctx.user._id, {
        training: userTraining.filter(
          (id: import('./_generated/dataModel').Id<'training'>) => id !== args.trainingId
        )
      })
    }

    await ctx.db.delete(args.trainingId)
    return null
  },
  { returns: z.null() }
)

// Get user's training
export const getMyTraining = zQuery(
  authQuery,
  {},
  async (ctx) => {
    // PROFILE-FIRST: Get training from profile if active
    let trainingIds = ctx.user?.training || []

    if (ctx.user?.activeProfileType && (ctx.user?.activeDancerId || ctx.user?.activeChoreographerId)) {
      let profile = null

      if (ctx.user.activeProfileType === 'dancer' && ctx.user.activeDancerId) {
        profile = await ctx.db.get(ctx.user.activeDancerId)
      } else if (ctx.user.activeProfileType === 'choreographer' && ctx.user.activeChoreographerId) {
        profile = await ctx.db.get(ctx.user.activeChoreographerId)
      }

      if (profile?.training) {
        trainingIds = profile.training as any
      }
    }

    if (!Array.isArray(trainingIds) || trainingIds.length === 0) return []

    const training = await getAll(ctx.db, trainingIds)
    return training
      .filter(notEmpty)
      .sort((a, b) => ((a.orderIndex as number) || 0) - ((b.orderIndex as number) || 0))
      .map(({ orderIndex, userId, profileType, profileId, ...rest }) => rest) as any
  },
  { returns: z.array(zTrainingFormDoc) }
)

// Get user's training by type
export const getMyTrainingByType = zQuery(
  authQuery,
  { type: zTrainingInput.shape.type },
  async (ctx, args) => {
    // PROFILE-FIRST: Get training from profile if active
    let trainingIds = ctx.user?.training || []

    if (ctx.user?.activeProfileType && (ctx.user?.activeDancerId || ctx.user?.activeChoreographerId)) {
      let profile = null

      if (ctx.user.activeProfileType === 'dancer' && ctx.user.activeDancerId) {
        profile = await ctx.db.get(ctx.user.activeDancerId)
      } else if (ctx.user.activeProfileType === 'choreographer' && ctx.user.activeChoreographerId) {
        profile = await ctx.db.get(ctx.user.activeChoreographerId)
      }

      if (profile?.training) {
        trainingIds = profile.training as any
      }
    }

    if (!Array.isArray(trainingIds) || trainingIds.length === 0) return []

    const training = await getAll(ctx.db, trainingIds)
    return training
      .filter(notEmpty)
      .filter((t) => t.type === args.type)
      .sort((a, b) => ((a.orderIndex as number) || 0) - ((b.orderIndex as number) || 0))
      .map(({ orderIndex, userId, profileType, profileId, ...rest }) => rest) as any
  },
  { returns: z.array(zTrainingFormDoc) }
)

// Reorder training items
export const reorderMyTraining = zMutation(
  authMutation,
  { trainingIds: z.array(zid('training')) },
  async (ctx, args) => {
    // Update order indexes
    for (let i = 0; i < args.trainingIds.length; i++) {
      await ctx.db.patch(args.trainingIds[i], {
        orderIndex: i
      })
    }
    return null
  },
  { returns: z.null() }
)

// Get public training for a user
export const getUserPublicTraining = zQuery(
  query,
  { userId: zid('users') },
  async (ctx, args) => {
    const user = await ctx.db.get(args.userId)
    if (!user?.training) return []

    const trainingIds: any = user.training
    const training = await getAll(ctx.db as any, trainingIds)

    return training
      .filter(notEmpty)
      .sort((a, b) => ((a.orderIndex as number) || 0) - ((b.orderIndex as number) || 0))
      .map(({ orderIndex, userId, ...rest }) => rest) as any
  },
  { returns: z.array(zTrainingFormDoc) }
)
