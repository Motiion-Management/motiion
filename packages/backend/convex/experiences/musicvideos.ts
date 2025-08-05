import { authMutation, authQuery, notEmpty } from '../util'
import { v } from 'convex/values'
import { ExperiencesMusicVideos } from '../validators/experiencesMusicVideos'
import { getAll } from 'convex-helpers/server/relationships'
import { query } from '../_generated/server'
import { crud } from 'convex-helpers/server'

// Basic CRUD operations
export const { read } = crud(ExperiencesMusicVideos, query, authMutation)
export const { create, update, destroy } = crud(
  ExperiencesMusicVideos,
  authQuery,
  authMutation
)

// Add Music Video experience to user's resume
export const addMyExperience = authMutation({
  args: ExperiencesMusicVideos.withoutSystemFields,
  returns: v.null(),
  handler: async (ctx, experience) => {
    const expId = await ctx.db.insert('experiencesMusicVideos', experience)
    await ctx.db.patch(ctx.user._id, {
      resume: {
        ...ctx.user.resume,
        experiencesMusicVideos: [...(ctx.user?.resume?.experiencesMusicVideos || []), expId]
      }
    })
    return null
  }
})

// Remove Music Video experience from user's resume
export const removeMyExperience = authMutation({
  args: { experienceId: v.id('experiencesMusicVideos') },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(ctx.user._id, {
      resume: {
        ...ctx.user.resume,
        experiencesMusicVideos: (ctx.user.resume?.experiencesMusicVideos || []).filter(
          (id) => id !== args.experienceId
        )
      }
    })
    await ctx.db.delete(args.experienceId)
    return null
  }
})

// Get user's Music Video experiences
export const getMyExperiences = authQuery({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    if (!ctx.user?.resume?.experiencesMusicVideos) return []

    const experienceIds = ctx.user.resume.experiencesMusicVideos
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

// Get public Music Video experiences for a user
export const getUserPublicExperiences = query({
  args: { userId: v.id('users') },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId)
    if (!user?.resume?.experiencesMusicVideos) return []
    
    const experienceIds = user.resume.experiencesMusicVideos
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