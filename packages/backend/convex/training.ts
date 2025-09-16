import { authMutation, authQuery, notEmpty } from './util'
import { Training, trainingInput, zTrainingInput } from './schemas/training'
import { getAll } from 'convex-helpers/server/relationships'
import { query } from './_generated/server'
import { zCrud, zMutation, zQuery } from '@packages/zodvex'
import { z } from 'zod'
import { zid } from 'convex-helpers/server/zodV4'

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
    // Get current max order index
    const existingTraining = await ctx.db
      .query('training')
      .withIndex('by_userId', (q) => q.eq('userId', ctx.user._id))
      .collect()

    const maxOrderIndex = Math.max(
      0,
      ...existingTraining.map((t) => t.orderIndex || 0)
    )

    const trainingId = await ctx.db.insert('training', {
      ...training,
      userId: ctx.user._id,
      orderIndex: maxOrderIndex + 1
    })

    await ctx.db.patch(ctx.user._id, {
      training: [...(ctx.user?.training || []), trainingId]
    })
    return null
  }
)

// Remove training from user
export const removeMyTraining = zMutation(
  authMutation,
  { trainingId: zid('training') },
  async (ctx, args) => {
    await ctx.db.patch(ctx.user._id, {
      training: (ctx.user.training || []).filter(
        (id: import('./_generated/dataModel').Id<'training'>) => id !== args.trainingId
      )
    })
    await ctx.db.delete(args.trainingId)
    return null
  }
)

// Get user's training
export const getMyTraining = zQuery(
  authQuery,
  {},
  async (ctx) => {
    if (!ctx.user?.training) return []

    const trainingIds = ctx.user.training
    const training = await getAll(ctx.db, trainingIds)
    return training
      .filter(notEmpty)
      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
      .map(({ orderIndex, userId, ...rest }: any) => rest)
  }
)

// Get user's training by type
export const getMyTrainingByType = zQuery(
  authQuery,
  { type: zTrainingInput.shape.type },
  async (ctx, args) => {
    if (!ctx.user?.training) return []

    const trainingIds = ctx.user.training
    const training = await getAll(ctx.db, trainingIds)
    return training
      .filter(notEmpty)
      .filter((t) => t.type === args.type)
      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
      .map(({ orderIndex, userId, ...rest }: any) => rest)
  }
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
  }
)

// Get public training for a user
export const getUserPublicTraining = zQuery(
  query,
  { userId: zid('users') },
  async (ctx, args) => {
    const user = await ctx.db.get(args.userId)
    if (!user?.training) return []

    const trainingIds = user.training
    const training = await getAll(ctx.db, trainingIds)

    return training
      .filter(notEmpty)
      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
      .map(({ orderIndex, userId, ...rest }: any) => rest)
  }
)
