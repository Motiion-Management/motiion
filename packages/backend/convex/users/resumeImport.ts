import { authMutation, authAction } from '../util'
import { internal } from '../_generated/api'
import { ConvexError, v } from 'convex/values'
import { Id } from '../_generated/dataModel'
import { zMutation, zLoose } from 'zodvex'
import { z } from 'zod'
import { zid } from 'zodvex'
import type { ParsedResumeData } from '../ai/schemas'

// Schema definitions must come first for type inference

// Define the complex schema for parsed resume
const experienceSchema = z.object({
  type: z.enum([
    'tv-film',
    'music-video',
    'live-performance',
    'commercial'
  ]),
  title: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  roles: z.array(z.string()).optional(),
  studio: z.string().optional(),
  artists: z.array(z.string()).optional(),
  companyName: z.string().optional(),
  productionCompany: z.string().optional(),
  tourArtist: z.string().optional(),
  venue: z.string().optional(),
  subtype: z.enum([
    'festival',
    'tour',
    'concert',
    'corporate',
    'award-show',
    'theater',
    'other'
  ]).optional(),
  mainTalent: z.array(z.string()).optional(),
  choreographers: z.array(z.string()).optional(),
  associateChoreographers: z.array(z.string()).optional(),
  directors: z.array(z.string()).optional()
})

const trainingSchema = z.object({
  type: z.enum([
    'education',
    'dance-school',
    'programs-intensives',
    'scholarships',
    'other'
  ]),
  institution: z.string(),
  instructors: z.array(z.string()).optional(),
  startYear: z.number().optional(),
  endYear: z.number().optional(),
  degree: z.string().optional()
})

const parsedResumeSchema = z.object({
  experiences: z.array(experienceSchema),
  training: z.array(trainingSchema),
  skills: z.array(z.string()),
  genres: z.array(z.string()),
  sagAftraId: z.string().optional()
})

// Note: avoid global z.infer on large schemas to reduce TS instantiation depth

// New unified document parsing action
// Note: keeping original authAction to avoid TypeScript circularity issues
export const parseResumeDocument = authAction({
  args: {
    storageId: v.id('_storage')
  },
  handler: async (ctx, args): Promise<ParsedResumeData> => {
    // Call the new unified document processor
    const result: ParsedResumeData = await ctx.runAction(
      internal.ai.documentProcessor.parseResumeDocument,
      {
        storageId: args.storageId,
        retryCount: undefined
      }
    )
    return result
  }
})

// Text-only parsing action for direct text input
// Note: keeping original authAction to avoid TypeScript circularity issues
export const parseResumeTextDirect = authAction({
  args: {
    text: v.string()
  },
  handler: async (ctx, args): Promise<ParsedResumeData> => {
    // Call the text parser
    const result: ParsedResumeData = await ctx.runAction(internal.ai.textParser.parseResumeText, {
      text: args.text,
      retryCount: undefined
    })
    return result
  }
})

export const applyParsedResumeData = zMutation(
  authMutation,
  zLoose(parsedResumeSchema),
  async (ctx, args) => {
    if (!ctx.user) {
      throw new ConvexError('User not authenticated')
    }

    try {
      const data = parsedResumeSchema.parse(args)
      // Create experiences
      const experienceIds: Id<'projects'>[] = []
      for (const experience of data.experiences) {
        const experienceId = await ctx.db.insert('projects', {
          userId: ctx.user._id,
          ...experience
        })
        experienceIds.push(experienceId)
      }

      // Create training entries
      const trainingIds: Id<'training'>[] = []
      for (let i = 0; i < data.training.length; i++) {
        const training = data.training[i]
        const trainingId = await ctx.db.insert('training', {
          userId: ctx.user._id,
          orderIndex: i,
          ...training
        })
        trainingIds.push(trainingId)
      }

      // Update user profile
      const updates: any = {}

      // Update resume with project references
      if (experienceIds.length > 0) {
        updates.resume = {
          ...ctx.user.resume,
          projects: [...(ctx.user.resume?.projects || []), ...experienceIds],
          skills: data.skills.length > 0 ? data.skills : ctx.user.resume?.skills,
          genres: data.genres.length > 0 ? data.genres : ctx.user.resume?.genres
        }
      } else if (data.skills.length > 0 || data.genres.length > 0) {
        updates.resume = {
          ...ctx.user.resume,
          skills: data.skills.length > 0 ? data.skills : ctx.user.resume?.skills,
          genres: data.genres.length > 0 ? data.genres : ctx.user.resume?.genres
        }
      }

      // Update training references
      if (trainingIds.length > 0) {
        updates.training = [...(ctx.user.training || []), ...trainingIds]
      }

      // Update SAG ID if provided
      if (data.sagAftraId) {
        updates.sagAftraId = data.sagAftraId
      }

      // Apply all updates
      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(ctx.user._id, updates)
      }

      return null
    } catch (error) {
      console.error('Failed to apply parsed resume data:', error)
      throw new ConvexError(
        `Failed to save resume data: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  },
  { returns: z.null() }
)
