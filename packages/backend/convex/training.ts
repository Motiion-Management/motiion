import { authMutation, authQuery, notEmpty, zq, zid } from './util'
import {
  Training,
  trainingInput,
  zTrainingInput,
  zTrainingFormDoc,
  training
} from './schemas/training'
import { getAll } from 'convex-helpers/server/relationships'
import { z } from 'zod'
import type { Doc } from './_generated/dataModel'

const zTrainingDoc = Training.zDoc

// Public read
export const read = zq({
  args: { id: zid('training') },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id)
  }
})

// Authenticated create
export const create = authMutation({
  args: training,
  returns: zid('training'),
  handler: async (ctx, args) => {
    return await ctx.db.insert('training', args)
  }
})

// Authenticated update
export const update = authMutation({
  args: {
    id: zid('training'),
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
  args: { id: zid('training') },
  returns: z.null(),
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id)
    return null
  }
})

// Add training to user
export const addMyTraining = authMutation({
  args: trainingInput,
  returns: z.null(),
  handler: async (ctx, training) => {
    // Get profile if active
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

    // Update training list in profile
    if (profile) {
      // TODO: Handle choreographer profiles in dedicated task
      const dancerProfile = profile as Doc<'dancers'>
      const profileTraining: any = Array.isArray(dancerProfile.training)
        ? dancerProfile.training
        : []
      await ctx.db.patch(dancerProfile._id, {
        training: [...profileTraining, trainingId]
      })
    }

    return null
  }
})

// Remove training from user
export const removeMyTraining = authMutation({
  args: { trainingId: zid('training') },
  returns: z.null(),
  handler: async (ctx, args) => {
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

    // Remove from training list in profile or user
    if (profile) {
      // TODO: Handle choreographer profiles in dedicated task
      const dancerProfile = profile as Doc<'dancers'>
      const profileTraining: any = Array.isArray(dancerProfile.training)
        ? dancerProfile.training
        : []
      await ctx.db.patch(dancerProfile._id, {
        training: profileTraining.filter(
          (id: import('./_generated/dataModel').Id<'training'>) =>
            id !== args.trainingId
        )
      })
    }

    await ctx.db.delete(args.trainingId)
    return null
  }
})

// Get user's training
export const getMyTraining = authQuery({
  args: {},
  returns: z.array(zTrainingFormDoc),
  handler: async (ctx) => {
    // Get training from profile
    let trainingIds

    if (
      ctx.user?.activeProfileType &&
      (ctx.user?.activeDancerId || ctx.user?.activeChoreographerId)
    ) {
      let profile = null

      if (ctx.user.activeProfileType === 'dancer' && ctx.user.activeDancerId) {
        profile = await ctx.db.get(ctx.user.activeDancerId)
      } else if (
        ctx.user.activeProfileType === 'choreographer' &&
        ctx.user.activeChoreographerId
      ) {
        profile = await ctx.db.get(ctx.user.activeChoreographerId)
      }

      if (profile) {
        // TODO: Handle choreographer profiles in dedicated task
        const dancerProfile = profile as Doc<'dancers'>
        if (dancerProfile.training) {
          trainingIds = dancerProfile.training
        }
      }
    }

    if (!Array.isArray(trainingIds) || trainingIds.length === 0) return []

    const training = await getAll(ctx.db, trainingIds)
    return training
      .filter(notEmpty)
      .sort(
        (a, b) =>
          ((a.orderIndex as number) || 0) - ((b.orderIndex as number) || 0)
      )
      .map(
        ({ orderIndex, userId, profileType, profileId, ...rest }) => rest
      ) as any
  }
})

// Get user's training by type
export const getMyTrainingByType = authQuery({
  args: { type: zTrainingInput.shape.type },
  returns: z.array(zTrainingFormDoc),
  handler: async (ctx, args) => {
    // Get training from profile
    let trainingIds: any[] = []

    if (
      ctx.user?.activeProfileType &&
      (ctx.user?.activeDancerId || ctx.user?.activeChoreographerId)
    ) {
      let profile = null

      if (ctx.user.activeProfileType === 'dancer' && ctx.user.activeDancerId) {
        profile = await ctx.db.get(ctx.user.activeDancerId)
      } else if (
        ctx.user.activeProfileType === 'choreographer' &&
        ctx.user.activeChoreographerId
      ) {
        profile = await ctx.db.get(ctx.user.activeChoreographerId)
      }

      if (profile) {
        // TODO: Handle choreographer profiles in dedicated task
        const dancerProfile = profile as Doc<'dancers'>
        if (dancerProfile.training) {
          trainingIds = dancerProfile.training as any
        }
      }
    }

    if (!Array.isArray(trainingIds) || trainingIds.length === 0) return []

    const training = (await getAll(ctx.db, trainingIds)) as Doc<'training'>[]
    return training
      .filter(notEmpty)
      .filter((t) => t.type === args.type)
      .sort(
        (a, b) =>
          ((a.orderIndex as number) || 0) - ((b.orderIndex as number) || 0)
      )
      .map(
        ({ orderIndex, userId, profileType, profileId, ...rest }) => rest
      ) as any
  }
})

// Reorder training items
export const reorderMyTraining = authMutation({
  args: { trainingIds: z.array(zid('training')) },
  returns: z.null(),
  handler: async (ctx, args) => {
    // Update order indexes
    for (let i = 0; i < args.trainingIds.length; i++) {
      await ctx.db.patch(args.trainingIds[i], {
        orderIndex: i
      })
    }
    return null
  }
})

// Get public training for a user
export const getUserPublicTraining = zq({
  args: { userId: zid('users') },
  returns: z.array(zTrainingFormDoc),
  handler: async (ctx, args) => {
    // Training is now stored in profiles, query by userId
    const training = await ctx.db
      .query('training')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .collect()

    return training
      .filter(notEmpty)
      .sort(
        (a, b) =>
          ((a.orderIndex as number) || 0) - ((b.orderIndex as number) || 0)
      )
      .map(
        ({ orderIndex, userId, profileType, profileId, ...rest }) => rest
      ) as any
  }
})
