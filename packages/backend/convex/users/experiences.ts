import { authMutation, authQuery, notEmpty } from '../util'
import { v } from 'convex/values'
import { Experiences } from '../validators/experiences'
import { getAll } from 'convex-helpers/server/relationships'
import { query } from '../_generated/server'

export const addMyExperience = authMutation({
  args: Experiences.withoutSystemFields,
  handler: async (ctx, experience) => {
    const expId = await ctx.db.insert('experiences', experience)
    await ctx.db.patch(ctx.user._id, {
      resume: {
        ...ctx.user.resume,
        experiences: [...(ctx.user?.resume?.experiences || []), expId]
      }
    })
  }
})

export const removeMyExperience = authMutation({
  args: { experienceId: v.id('experiences') },
  handler: async (ctx, args) => {
    await ctx.db.patch(ctx.user._id, {
      resume: {
        ...ctx.user.resume,
        experiences: (ctx.user.resume?.experiences || []).filter(
          (id) => id !== args.experienceId
        )
      }
    })
    await ctx.db.delete(args.experienceId)
  }
})

export const getMyExperiences = authQuery({
  args: {},
  handler: async (ctx) => {
    if (!ctx.user?.resume?.experiences) return []

    const experienceIds = ctx.user.resume.experiences
    const experiences = await getAll(ctx.db, experienceIds)
    return experiences.filter(notEmpty)
  }
})

export const getMyExperiencesByType = authQuery({
  args: { type: Experiences.withoutSystemFields.type },
  handler: async (ctx, args) => {
    if (!ctx.user?.resume?.experiences) return []

    const experienceIds = ctx.user.resume.experiences
    const experiences = await getAll(ctx.db, experienceIds)

    return experiences.filter(notEmpty).filter((exp) => exp.type === args.type)
  }
})

export const getUserPublicExperiences = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId)
    if (!user?.resume?.experiences) return []
    const experienceIds = user.resume.experiences
    const experiences = await getAll(ctx.db, experienceIds)

    return experiences.filter(notEmpty).filter((exp) => !exp?.private)
  }
})
