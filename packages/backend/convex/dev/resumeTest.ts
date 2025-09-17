import { action, mutation } from '../_generated/server'
import { internal } from '../_generated/api'
import { zAction, zMutation } from '@packages/zodvex'
import { z } from 'zod'
import { zid } from 'convex-helpers/server/zodV4'

// Define schemas for resume parsing
const experienceSchema = z.object({
  type: z.enum(['tv-film', 'music-video', 'live-performance', 'commercial']),
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

type Experience = z.infer<typeof experienceSchema>
type TrainingEntry = z.infer<typeof trainingSchema>
type ParsedResume = z.infer<typeof parsedResumeSchema>

// Dev-only: generate an upload URL without requiring auth
export const generateUploadUrlDev = zMutation(
  mutation,
  {},
  async (ctx): Promise<string> => {
    return await ctx.storage.generateUploadUrl()
  },
  { returns: z.string() }
)

// Dev-only: parse a resume document by storage id without touching user data
export const parseResumeDocumentDev = zAction(
  action,
  { storageId: zid('_storage') },
  async (ctx, args): Promise<ParsedResume> => {
    return await ctx.runAction(
      internal.ai.documentProcessor.parseResumeDocument,
      {
        storageId: args.storageId,
        retryCount: undefined
      }
    )
  },
  { returns: parsedResumeSchema }
)
