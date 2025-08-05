import { authMutation, authQuery, notEmpty } from '../util'
import { v } from 'convex/values'
import { ExperiencesLivePerformances } from '../validators/experiencesLivePerformances'
import { getAll } from 'convex-helpers/server/relationships'
import { query } from '../_generated/server'
import { crud } from 'convex-helpers/server'

// Basic CRUD operations
export const { read } = crud(ExperiencesLivePerformances, query, authMutation)
export const { create, update, destroy } = crud(
  ExperiencesLivePerformances,
  authQuery,
  authMutation
)

// Add Live Performance experience to user's resume
export const addMyExperience = authMutation({
  args: ExperiencesLivePerformances.withoutSystemFields,
  returns: v.null(),
  handler: async (ctx, experience) => {
    const expId = await ctx.db.insert('experiencesLivePerformances', experience)
    await ctx.db.patch(ctx.user._id, {
      resume: {
        ...ctx.user.resume,
        experiencesLivePerformances: [...(ctx.user?.resume?.experiencesLivePerformances || []), expId]
      }
    })
    return null
  }
})

// Remove Live Performance experience from user's resume
export const removeMyExperience = authMutation({
  args: { experienceId: v.id('experiencesLivePerformances') },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(ctx.user._id, {
      resume: {
        ...ctx.user.resume,
        experiencesLivePerformances: (ctx.user.resume?.experiencesLivePerformances || []).filter(
          (id) => id !== args.experienceId
        )
      }
    })
    await ctx.db.delete(args.experienceId)
    return null
  }
})

// Get user's Live Performance experiences
export const getMyExperiences = authQuery({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    if (!ctx.user?.resume?.experiencesLivePerformances) return []

    const experienceIds = ctx.user.resume.experiencesLivePerformances
    const experiences = await getAll(ctx.db, experienceIds)
    return experiences
      .filter(notEmpty)
      .sort((a, b) => {
        // Sort by start date descending
        const dateA = new Date(a.startDate).getTime()
        const dateB = new Date(b.startDate).getTime()
        return dateB - dateA
      })
  }
})

// Get user's Live Performance experiences by event type
export const getMyExperiencesByType = authQuery({
  args: { eventType: ExperiencesLivePerformances.withoutSystemFields.eventType },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    if (!ctx.user?.resume?.experiencesLivePerformances) return []

    const experienceIds = ctx.user.resume.experiencesLivePerformances
    const experiences = await getAll(ctx.db, experienceIds)
    return experiences
      .filter(notEmpty)
      .filter((exp) => exp.eventType === args.eventType)
      .sort((a, b) => {
        const dateA = new Date(a.startDate).getTime()
        const dateB = new Date(b.startDate).getTime()
        return dateB - dateA
      })
  }
})

// Get public Live Performance experiences for a user
export const getUserPublicExperiences = query({
  args: { userId: v.id('users') },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId)
    if (!user?.resume?.experiencesLivePerformances) return []
    
    const experienceIds = user.resume.experiencesLivePerformances
    const experiences = await getAll(ctx.db, experienceIds)

    return experiences
      .filter(notEmpty)
      .filter((exp) => !exp?.private)
      .sort((a, b) => {
        const dateA = new Date(a.startDate).getTime()
        const dateB = new Date(b.startDate).getTime()
        return dateB - dateA
      })
  }
})

// Get public Live Performance experiences by event type
export const getUserPublicExperiencesByType = query({
  args: { 
    userId: v.id('users'),
    eventType: ExperiencesLivePerformances.withoutSystemFields.eventType
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId)
    if (!user?.resume?.experiencesLivePerformances) return []
    
    const experienceIds = user.resume.experiencesLivePerformances
    const experiences = await getAll(ctx.db, experienceIds)

    return experiences
      .filter(notEmpty)
      .filter((exp) => exp.eventType === args.eventType)
      .filter((exp) => !exp?.private)
      .sort((a, b) => {
        const dateA = new Date(a.startDate).getTime()
        const dateB = new Date(b.startDate).getTime()
        return dateB - dateA
      })
  }
})