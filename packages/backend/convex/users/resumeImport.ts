import { authMutation, authQuery, authAction } from '../util'
import { v } from 'convex/values'
import { internal } from '../_generated/api'
import { ConvexError } from 'convex/values'
import { Id } from '../_generated/dataModel'

type Experience = {
  type: 'tv-film' | 'music-video' | 'live-performance' | 'commercial'
  title?: string
  startDate?: string
  endDate?: string
  roles?: string[]
  studio?: string
  artists?: string[]
  companyName?: string
  productionCompany?: string
  tourArtist?: string
  venue?: string
  subtype?:
    | 'festival'
    | 'tour'
    | 'concert'
    | 'corporate'
    | 'award-show'
    | 'theater'
    | 'other'
  mainTalent?: string[]
  choreographers?: string[]
  associateChoreographers?: string[]
  directors?: string[]
}

type TrainingEntry = {
  type:
    | 'education'
    | 'dance-school'
    | 'programs-intensives'
    | 'scholarships'
    | 'other'
  institution: string
  instructors?: string[]
  startYear?: number
  endYear?: number
  degree?: string
}

type ParsedResume = {
  experiences: Experience[]
  training: TrainingEntry[]
  skills: string[]
  genres: string[]
  sagAftraId?: string
}

// New unified document parsing action
export const parseResumeDocument = authAction({
  args: {
    storageId: v.id('_storage')
  },
  returns: v.object({
    experiences: v.array(
      v.object({
        type: v.union(
          v.literal('tv-film'),
          v.literal('music-video'),
          v.literal('live-performance'),
          v.literal('commercial')
        ),
        title: v.optional(v.string()),
        startDate: v.optional(v.string()),
        endDate: v.optional(v.string()),
        roles: v.optional(v.array(v.string())),
        studio: v.optional(v.string()),
        artists: v.optional(v.array(v.string())),
        companyName: v.optional(v.string()),
        productionCompany: v.optional(v.string()),
        tourArtist: v.optional(v.string()),
        venue: v.optional(v.string()),
        subtype: v.optional(
          v.union(
            v.literal('festival'),
            v.literal('tour'),
            v.literal('concert'),
            v.literal('corporate'),
            v.literal('award-show'),
            v.literal('theater'),
            v.literal('other')
          )
        ),
        mainTalent: v.optional(v.array(v.string())),
        choreographers: v.optional(v.array(v.string())),
        associateChoreographers: v.optional(v.array(v.string())),
        directors: v.optional(v.array(v.string()))
      })
    ),
    training: v.array(
      v.object({
        type: v.union(
          v.literal('education'),
          v.literal('dance-school'),
          v.literal('programs-intensives'),
          v.literal('scholarships'),
          v.literal('other')
        ),
        institution: v.string(),
        instructors: v.optional(v.array(v.string())),
        startYear: v.optional(v.number()),
        endYear: v.optional(v.number()),
        degree: v.optional(v.string())
      })
    ),
    skills: v.array(v.string()),
    genres: v.array(v.string()),
    sagAftraId: v.optional(v.string())
  }),
  handler: async (ctx, args): Promise<ParsedResume> => {
    // Call the new unified document processor
    return await ctx.runAction(
      internal.ai.documentProcessor.parseResumeDocument,
      {
        storageId: args.storageId
      }
    )
  }
})

// Text-only parsing action for direct text input
export const parseResumeTextDirect = authAction({
  args: {
    text: v.string()
  },
  returns: v.object({
    experiences: v.array(
      v.object({
        type: v.union(
          v.literal('tv-film'),
          v.literal('music-video'),
          v.literal('live-performance'),
          v.literal('commercial')
        ),
        title: v.optional(v.string()),
        startDate: v.optional(v.string()),
        endDate: v.optional(v.string()),
        roles: v.optional(v.array(v.string())),
        studio: v.optional(v.string()),
        artists: v.optional(v.array(v.string())),
        companyName: v.optional(v.string()),
        productionCompany: v.optional(v.string()),
        tourArtist: v.optional(v.string()),
        venue: v.optional(v.string()),
        subtype: v.optional(
          v.union(
            v.literal('festival'),
            v.literal('tour'),
            v.literal('concert'),
            v.literal('corporate'),
            v.literal('award-show'),
            v.literal('theater'),
            v.literal('other')
          )
        ),
        mainTalent: v.optional(v.array(v.string())),
        choreographers: v.optional(v.array(v.string())),
        associateChoreographers: v.optional(v.array(v.string())),
        directors: v.optional(v.array(v.string()))
      })
    ),
    training: v.array(
      v.object({
        type: v.union(
          v.literal('education'),
          v.literal('dance-school'),
          v.literal('programs-intensives'),
          v.literal('scholarships'),
          v.literal('other')
        ),
        institution: v.string(),
        instructors: v.optional(v.array(v.string())),
        startYear: v.optional(v.number()),
        endYear: v.optional(v.number()),
        degree: v.optional(v.string())
      })
    ),
    skills: v.array(v.string()),
    genres: v.array(v.string()),
    sagAftraId: v.optional(v.string())
  }),
  handler: async (ctx, args): Promise<ParsedResume> => {
    // Call the text parser
    return await ctx.runAction(internal.ai.textParser.parseResumeText, {
      text: args.text
    })
  }
})

export const applyParsedResumeData = authMutation({
  args: {
    experiences: v.array(
      v.object({
        type: v.union(
          v.literal('tv-film'),
          v.literal('music-video'),
          v.literal('live-performance'),
          v.literal('commercial')
        ),
        title: v.optional(v.string()),
        startDate: v.optional(v.string()),
        endDate: v.optional(v.string()),
        roles: v.optional(v.array(v.string())),
        studio: v.optional(v.string()),
        artists: v.optional(v.array(v.string())),
        companyName: v.optional(v.string()),
        productionCompany: v.optional(v.string()),
        tourArtist: v.optional(v.string()),
        venue: v.optional(v.string()),
        subtype: v.optional(
          v.union(
            v.literal('festival'),
            v.literal('tour'),
            v.literal('concert'),
            v.literal('corporate'),
            v.literal('award-show'),
            v.literal('theater'),
            v.literal('other')
          )
        ),
        mainTalent: v.optional(v.array(v.string())),
        choreographers: v.optional(v.array(v.string())),
        associateChoreographers: v.optional(v.array(v.string())),
        directors: v.optional(v.array(v.string()))
      })
    ),
    training: v.array(
      v.object({
        type: v.union(
          v.literal('education'),
          v.literal('dance-school'),
          v.literal('programs-intensives'),
          v.literal('scholarships'),
          v.literal('other')
        ),
        institution: v.string(),
        instructors: v.optional(v.array(v.string())),
        startYear: v.optional(v.number()),
        endYear: v.optional(v.number()),
        degree: v.optional(v.string())
      })
    ),
    skills: v.array(v.string()),
    genres: v.array(v.string()),
    sagAftraId: v.optional(v.string())
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (!ctx.user) {
      throw new ConvexError('User not authenticated')
    }

    try {
      // Create experiences
      const experienceIds: Id<'projects'>[] = []
      for (const experience of args.experiences) {
        const experienceId = await ctx.db.insert('projects', {
          userId: ctx.user._id,
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
          orderIndex: i,
          ...training
        })
        trainingIds.push(trainingId)
      }

      // Update user profile
      const updates: any = {}

      // Update resume with experience references
      if (experienceIds.length > 0) {
        updates.resume = {
          ...ctx.user.resume,
          experiences: [
            ...(ctx.user.resume?.experiences || []),
            ...experienceIds
          ],
          skills:
            args.skills.length > 0 ? args.skills : ctx.user.resume?.skills,
          genres: args.genres.length > 0 ? args.genres : ctx.user.resume?.genres
        }
      } else if (args.skills.length > 0 || args.genres.length > 0) {
        updates.resume = {
          ...ctx.user.resume,
          skills:
            args.skills.length > 0 ? args.skills : ctx.user.resume?.skills,
          genres: args.genres.length > 0 ? args.genres : ctx.user.resume?.genres
        }
      }

      // Update training references
      if (trainingIds.length > 0) {
        updates.training = [...(ctx.user.training || []), ...trainingIds]
      }

      // Update SAG ID if provided
      if (args.sagAftraId) {
        updates.sagAftraId = args.sagAftraId
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
  }
})
