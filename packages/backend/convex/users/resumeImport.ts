import { authMutation, authAction } from '../util'
import { internal } from '../_generated/api'
import { ConvexError, v } from 'convex/values'
import { Id } from '../_generated/dataModel'
import { z } from 'zod'
import { zid } from '@packages/zodvex'
import { getActiveProfileTarget } from './profileHelpers'

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

type ParsedResume = z.infer<typeof parsedResumeSchema>

// Types derived from schemas
type Experience = z.infer<typeof experienceSchema>
type TrainingEntry = z.infer<typeof trainingSchema>

// New unified document parsing action
// Note: keeping original authAction to avoid TypeScript circularity issues
export const parseResumeDocument: any = authAction({
  args: {
    storageId: zid('_storage')
  },
  handler: async (ctx, args) => {
    // Call the new unified document processor
    return await ctx.runAction(
      // @ts-expect-error - Type instantiation is excessively deep
      internal.ai.documentProcessor.parseResumeDocument,
      {
        storageId: args.storageId,
        retryCount: undefined
      }
    )
  }
})

// Text-only parsing action for direct text input
// Note: keeping original authAction to avoid TypeScript circularity issues
export const parseResumeTextDirect: any = authAction({
  args: {
    text: z.string()
  },
  handler: async (ctx, args) => {
    // Call the text parser
    return await ctx.runAction(internal.ai.textParser.parseResumeText, {
      text: args.text,
      retryCount: undefined
    })
  }
})

export const applyParsedResumeData = authMutation({
  args: parsedResumeSchema,
  returns: z.null(),
  handler: async (ctx, args) => {
    if (!ctx.user) {
      throw new ConvexError('User not authenticated')
    }

    try {
      const { targetId, profile } = await getActiveProfileTarget(ctx.db, ctx.user)

      // Add profile info for projects/training
      let profileInfo = {}
      if (profile) {
        if (ctx.user.activeProfileType === 'dancer') {
          profileInfo = {
            profileType: 'dancer' as const,
            profileId: ctx.user.activeDancerId
          }
        } else if (ctx.user.activeProfileType === 'choreographer') {
          profileInfo = {
            profileType: 'choreographer' as const,
            profileId: ctx.user.activeChoreographerId
          }
        }
      }

      // Create experiences
      const experienceIds: Id<'projects'>[] = []
      for (const experience of args.experiences) {
        const experienceId = await ctx.db.insert('projects', {
          userId: ctx.user._id,
          ...profileInfo,
          ...experience
        })
        experienceIds.push(experienceId)
      }

      // Create training entries
      const trainingIds: Id<'training'>[] = []
      for (let i = 0; i < args.training.length; i++) {
        const training = args.training[i]
        const trainingId = await ctx.db.insert('training', {
          userId: ctx.user._id,
          ...profileInfo,
          orderIndex: i,
          ...training
        })
        trainingIds.push(trainingId)
      }

      // Get current data from profile or user
      const currentResume = profile?.resume || ctx.user.resume
      const currentTraining = profile?.training || ctx.user.training

      // Build updates object
      const updates: any = {}

      // Update resume with project references
      if (experienceIds.length > 0) {
        updates.resume = {
          ...currentResume,
          projects: [...(currentResume?.projects || []), ...experienceIds],
          skills:
            args.skills.length > 0 ? args.skills : currentResume?.skills,
          genres: args.genres.length > 0 ? args.genres : currentResume?.genres
        }
      } else if (args.skills.length > 0 || args.genres.length > 0) {
        updates.resume = {
          ...currentResume,
          skills:
            args.skills.length > 0 ? args.skills : currentResume?.skills,
          genres: args.genres.length > 0 ? args.genres : currentResume?.genres
        }
      }

      // Update training references
      if (trainingIds.length > 0) {
        updates.training = [...(currentTraining || []), ...trainingIds]
      }

      // Update SAG ID if provided (dancer-specific field)
      if (args.sagAftraId && ctx.user.activeProfileType === 'dancer') {
        updates.sagAftraId = args.sagAftraId
      }

      // Apply all updates to profile or user
      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(targetId, updates)
      }

      return null
    } catch (error) {
      console.error('Failed to apply parsed resume data:', error)
      throw new ConvexError(
        `Failed to save resume data: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }
})
