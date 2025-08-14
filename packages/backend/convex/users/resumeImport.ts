import { authMutation, authQuery, authAction } from '../util'
import { v } from 'convex/values'
import { internal } from '../_generated/api'
import { ConvexError } from 'convex/values'
import { Id } from '../_generated/dataModel'

// Temporary storage for parsed resume data before user confirmation
interface PendingResumeImport {
  userId: Id<'users'>
  imageStorageId: Id<'_storage'>
  parsedData: any // The parsed resume data
  status: 'processing' | 'completed' | 'failed'
  error?: string
  createdAt: number
}

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

export const startResumeImport = authMutation({
  args: {
    imageStorageId: v.id('_storage')
  },
  returns: v.object({
    importId: v.string(),
    status: v.literal('processing')
  }),
  handler: async (
    ctx,
    args
  ): Promise<{ importId: string; status: 'processing' }> => {
    if (!ctx.user) {
      throw new ConvexError('User not authenticated')
    }

    // Create a unique import ID
    const importId = `resume_import_${ctx.user._id}_${Date.now()}`

    // Store the import request
    const pendingImport: PendingResumeImport = {
      userId: ctx.user._id,
      imageStorageId: args.imageStorageId,
      parsedData: null,
      status: 'processing',
      createdAt: Date.now()
    }

    // In a real implementation, you might store this in a temporary table
    // For now, we'll trigger the parsing immediately and return the result

    try {
      // Schedule the parsing action
      await ctx.scheduler.runAfter(
        0,
        internal.ai.resumeParser.parseResumeImage,
        {
          imageStorageId: args.imageStorageId
        }
      )

      return {
        importId,
        status: 'processing' as const
      }
    } catch (error) {
      console.error('Failed to start resume import:', error)
      throw new ConvexError('Failed to start resume processing')
    }
  }
})

export const checkImportStatus = authQuery({
  args: {
    importId: v.string()
  },
  returns: v.union(
    v.object({
      status: v.literal('processing')
    }),
    v.object({
      status: v.literal('completed'),
      parsedData: v.object({
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
      })
    }),
    v.object({
      status: v.literal('failed'),
      error: v.string()
    })
  ),
  handler: async (
    ctx,
    args
  ): Promise<
    | { status: 'processing' }
    | { status: 'completed'; parsedData: ParsedResume }
    | { status: 'failed'; error: string }
  > => {
    // In a real implementation, you would check a temporary storage table
    // For now, we'll return a mock status since we don't have persistent import tracking

    // This is a simplified version - in production you'd store import status
    return {
      status: 'processing' as const
    }
  }
})

// Simplified action that directly parses and returns data
export const parseResumeImageDirect = authAction({
  args: {
    imageStorageId: v.id('_storage')
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
    // Call the internal parser action directly
    return await ctx.runAction(internal.ai.resumeParser.parseResumeImage, {
      imageStorageId: args.imageStorageId
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
      const experienceIds: Id<'experiences'>[] = []
      for (const experience of args.experiences) {
        const experienceId = await ctx.db.insert('experiences', {
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
