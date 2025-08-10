import { authMutation, authQuery, notEmpty } from '../util'
import { v } from 'convex/values'
import { Experiences } from '../validators/experiences'
import { query } from '../_generated/server'
import { crud } from 'convex-helpers/server'

// Basic CRUD for unified experiences table
export const { read } = crud(Experiences, query, authMutation)
export const { create, update, destroy } = crud(Experiences, authQuery, authMutation)

// Create experience and add to user's resume.experiences (legacy field)
export const addMyExperience = authMutation({
  args: Experiences.withoutSystemFields,
  returns: v.id('experiences'),
  handler: async (ctx, experience) => {
    const expId = await ctx.db.insert('experiences', experience)
    await ctx.db.patch(ctx.user._id, {
      resume: {
        ...ctx.user.resume,
        experiences: [...(ctx.user?.resume?.experiences || []), expId]
      }
    })
    return expId
  }
})

// Remove experience from user's resume and delete
export const removeMyExperience = authMutation({
  args: { experienceId: v.id('experiences') },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(ctx.user._id, {
      resume: {
        ...ctx.user.resume,
        experiences: (ctx.user.resume?.experiences || []).filter((id) => id !== args.experienceId)
      }
    })
    await ctx.db.delete(args.experienceId)
    return null
  }
})

// Get all my experiences (from index)
export const getMyExperiences = authQuery({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const exps = await ctx.db
      .query('experiences')
      .withIndex('userId', (q) => q.eq('userId', ctx.user._id))
      .collect()
    return exps.filter(notEmpty)
  }
})

// Get public experiences for a user
export const getUserPublicExperiences = query({
  args: { userId: v.id('users') },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const exps = await ctx.db
      .query('experiences')
      .withIndex('userId', (q) => q.eq('userId', args.userId))
      .collect()
    return exps.filter((e) => !e?.private)
  }
})

