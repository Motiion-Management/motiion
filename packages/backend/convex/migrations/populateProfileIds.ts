import { internalMutation } from '../_generated/server'
import { v } from 'convex/values'
import type { Id } from '../_generated/dataModel'

/**
 * Phase 4: Populate profileId on Projects and Training
 *
 * These functions populate profileId for existing projects and training records
 * that only have userId. This ensures records are properly linked to profiles.
 */

export const populateProjectProfileIds = internalMutation({
  args: {},
  returns: v.object({
    total: v.number(),
    updated: v.number(),
    skipped: v.number(),
    errors: v.number()
  }),
  handler: async (ctx) => {
    const projects = await ctx.db.query('projects').collect()
    let updated = 0
    let skipped = 0
    let errors = 0

    for (const project of projects) {
      try {
        // Skip if already has profileId
        if (project.profileId) {
          skipped++
          continue
        }

        // Get user to find their active profile
        const user = await ctx.db.get(project.userId as Id<'users'>)
        if (!user) {
          console.error('User not found for project', project._id)
          errors++
          continue
        }

        // Determine profileId and profileType
        let profileId = null
        let profileType = null

        if (user.activeDancerId) {
          profileId = user.activeDancerId
          profileType = 'dancer' as const
        } else if (user.activeChoreographerId) {
          profileId = user.activeChoreographerId
          profileType = 'choreographer' as const
        }

        // Update project with profile references
        if (profileId && profileType) {
          await ctx.db.patch(project._id, {
            profileId,
            profileType
          })
          updated++
        } else {
          console.warn(
            'No active profile found for user',
            user._id,
            'project',
            project._id
          )
          errors++
        }
      } catch (error) {
        console.error('Error updating project', project._id, error)
        errors++
      }
    }

    return { total: projects.length, updated, skipped, errors }
  }
})

export const populateTrainingProfileIds = internalMutation({
  args: {},
  returns: v.object({
    total: v.number(),
    updated: v.number(),
    skipped: v.number(),
    errors: v.number()
  }),
  handler: async (ctx) => {
    const trainingRecords = await ctx.db.query('training').collect()
    let updated = 0
    let skipped = 0
    let errors = 0

    for (const training of trainingRecords) {
      try {
        // Skip if already has profileId
        if (training.profileId) {
          skipped++
          continue
        }

        // Get user to find their active profile
        const user = await ctx.db.get(training.userId as Id<'users'>)
        if (!user) {
          console.error('User not found for training', training._id)
          errors++
          continue
        }

        // Determine profileId and profileType
        let profileId = null
        let profileType = null

        if (user.activeDancerId) {
          profileId = user.activeDancerId
          profileType = 'dancer' as const
        } else if (user.activeChoreographerId) {
          profileId = user.activeChoreographerId
          profileType = 'choreographer' as const
        }

        // Update training with profile references
        if (profileId && profileType) {
          await ctx.db.patch(training._id, {
            profileId,
            profileType
          })
          updated++
        } else {
          console.warn(
            'No active profile found for user',
            user._id,
            'training',
            training._id
          )
          errors++
        }
      } catch (error) {
        console.error('Error updating training', training._id, error)
        errors++
      }
    }

    return { total: trainingRecords.length, updated, skipped, errors }
  }
})

export const populateAllProfileIds = internalMutation({
  args: {},
  returns: v.object({
    projects: v.object({
      total: v.number(),
      updated: v.number(),
      skipped: v.number(),
      errors: v.number()
    }),
    training: v.object({
      total: v.number(),
      updated: v.number(),
      skipped: v.number(),
      errors: v.number()
    })
  }),
  handler: async (ctx) => {
    // Run both migrations sequentially
    const projects = await ctx.db.query('projects').collect()
    const training = await ctx.db.query('training').collect()

    let projectsUpdated = 0
    let projectsSkipped = 0
    let projectsErrors = 0

    for (const project of projects) {
      try {
        if (project.profileId) {
          projectsSkipped++
          continue
        }

        const user = await ctx.db.get(project.userId as Id<'users'>)
        if (!user) {
          projectsErrors++
          continue
        }

        const profileId = user.activeDancerId || user.activeChoreographerId
        const profileType = user.activeDancerId ? 'dancer' as const : user.activeChoreographerId ? 'choreographer' as const : null

        if (profileId && profileType) {
          await ctx.db.patch(project._id, { profileId, profileType })
          projectsUpdated++
        } else {
          projectsErrors++
        }
      } catch (error) {
        projectsErrors++
      }
    }

    let trainingUpdated = 0
    let trainingSkipped = 0
    let trainingErrors = 0

    for (const trainingRecord of training) {
      try {
        if (trainingRecord.profileId) {
          trainingSkipped++
          continue
        }

        const user = await ctx.db.get(trainingRecord.userId as Id<'users'>)
        if (!user) {
          trainingErrors++
          continue
        }

        const profileId = user.activeDancerId || user.activeChoreographerId
        const profileType = user.activeDancerId ? 'dancer' as const : user.activeChoreographerId ? 'choreographer' as const : null

        if (profileId && profileType) {
          await ctx.db.patch(trainingRecord._id, { profileId, profileType })
          trainingUpdated++
        } else {
          trainingErrors++
        }
      } catch (error) {
        trainingErrors++
      }
    }

    return {
      projects: {
        total: projects.length,
        updated: projectsUpdated,
        skipped: projectsSkipped,
        errors: projectsErrors
      },
      training: {
        total: training.length,
        updated: trainingUpdated,
        skipped: trainingSkipped,
        errors: trainingErrors
      }
    }
  }
})
