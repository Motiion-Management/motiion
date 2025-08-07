import { authMutation, authQuery } from '../util'
import { v } from 'convex/values'
import { z } from 'zod'
import { zid } from 'convex-helpers/server/zod'

/**
 * Form-specific mutations for TV/Film experiences
 * These mutations define exactly what fields are expected for each form variant
 */

// Basic form fields (for quick creation)
export const createBasicExperience = authMutation({
  args: {
    title: v.string(),
    studio: v.string(),
    startDate: v.string(),
    duration: v.string(),
    roles: v.array(v.string())
  },
  returns: v.id('experiencesTvFilm'),
  handler: async (ctx, args) => {
    // Create with basic fields only
    const expId = await ctx.db.insert('experiencesTvFilm', {
      userId: ctx.user._id,
      title: args.title,
      studio: args.studio,
      startDate: args.startDate,
      duration: args.duration,
      roles: args.roles,
      private: false // Default to public
    })

    // Update user's resume
    await ctx.db.patch(ctx.user._id, {
      resume: {
        ...ctx.user.resume,
        experiencesTvFilm: [
          ...(ctx.user?.resume?.experiencesTvFilm || []),
          expId
        ]
      }
    })

    return expId
  }
})

// Detailed form fields (for complete information)
export const updateDetailedExperience = authMutation({
  args: {
    id: v.id('experiencesTvFilm'),
    link: v.optional(v.string()),
    mainTalent: v.optional(v.array(v.string())),
    choreographers: v.optional(v.array(v.string())),
    associateChoreographers: v.optional(v.array(v.string())),
    private: v.optional(v.boolean())
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { id, ...updates } = args

    // Verify ownership
    const experience = await ctx.db.get(id)
    if (!experience || experience.userId !== ctx.user._id) {
      throw new Error('Unauthorized: Cannot update this experience')
    }

    // Update with detailed fields
    await ctx.db.patch(id, updates)
    return null
  }
})

// Combined update (for editing existing experiences)
export const updateFullExperience = authMutation({
  args: {
    id: v.id('experiencesTvFilm'),
    // Basic fields
    title: v.optional(v.string()),
    studio: v.optional(v.string()),
    startDate: v.optional(v.string()),
    duration: v.optional(v.string()),
    roles: v.optional(v.array(v.string())),
    // Detailed fields
    link: v.optional(v.string()),
    mainTalent: v.optional(v.array(v.string())),
    choreographers: v.optional(v.array(v.string())),
    associateChoreographers: v.optional(v.array(v.string())),
    private: v.optional(v.boolean())
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { id, ...updates } = args

    // Verify ownership
    const experience = await ctx.db.get(id)
    if (!experience || experience.userId !== ctx.user._id) {
      throw new Error('Unauthorized: Cannot update this experience')
    }

    // Update all provided fields
    await ctx.db.patch(id, updates)
    return null
  }
})

/**
 * Export Zod schemas for use in frontend forms
 * These can be imported directly in React Native components
 */

// Basic form schema (matches createBasicExperience args)
export const zBasicTvFilmForm = z.object({
  title: z.string().min(1, 'Title is required'),
  studio: z.string().min(1, 'Studio is required'),
  startDate: z.string().describe('label:Start Date|width:half'),
  duration: z.string().describe('label:Duration|width:half'),
  roles: z.array(z.string()).min(1, 'At least one role is required')
})

// Detailed form schema (matches updateDetailedExperience args)
export const zDetailedTvFilmForm = z.object({
  link: z.string().url('Must be a valid URL').optional(),
  mainTalent: z.array(z.string()).optional(),
  choreographers: z.array(z.string()).optional(),
  associateChoreographers: z.array(z.string()).optional(),
  private: z.boolean().optional()
})

// Full form schema (for editing)
export const zFullTvFilmForm = z.object({
  id: zid('experiencesTvFilm'),
  title: z.string().min(1).optional(),
  studio: z.string().min(1).optional(),
  startDate: z.string().optional().describe('label:Start Date|width:half'),
  duration: z.string().optional().describe('label:Duration|width:half'),
  roles: z.array(z.string()).optional(),
  link: z.string().url().optional(),
  mainTalent: z.array(z.string()).optional(),
  choreographers: z.array(z.string()).optional(),
  associateChoreographers: z.array(z.string()).optional(),
  private: z.boolean().optional()
})
