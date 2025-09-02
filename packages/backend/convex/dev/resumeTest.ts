import { action, mutation } from '../_generated/server'
import { v } from 'convex/values'
import { internal } from '../_generated/api'

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

// Dev-only: generate an upload URL without requiring auth
export const generateUploadUrlDev = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx): Promise<string> => {
    return await ctx.storage.generateUploadUrl()
  }
})

// Dev-only: parse a resume document by storage id without touching user data
export const parseResumeDocumentDev = action({
  args: { storageId: v.id('_storage') },
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
    return await ctx.runAction(
      internal.ai.documentProcessor.parseResumeDocument,
      {
        storageId: args.storageId
      }
    )
  }
})
