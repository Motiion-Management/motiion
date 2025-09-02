import { z } from 'zod'
import { zExperiences } from '../validators/experiences'
import { zTrainingInput } from '../validators/training'

// Use centralized validators but omit fields that AI shouldn't handle
export const experienceSchema = zExperiences.omit({
  userId: true,
  private: true,
  duration: true,
  link: true,
  media: true,
  searchPattern: true
})

// For training, use the input schema (without userId/orderIndex) but make institution required for AI
export const trainingSchema = zTrainingInput.extend({
  institution: z.string() // Make required for AI parsing
})

// Complete parsed resume schema - aligns with users.resume structure
export const resumeSchema = z.object({
  experiences: z.array(experienceSchema),
  training: z.array(trainingSchema),
  skills: z.array(z.string()),
  genres: z.array(z.string()),
  sagAftraId: z.string().optional()
})

export type ParsedExperience = z.infer<typeof experienceSchema>
export type ParsedTraining = z.infer<typeof trainingSchema>
export type ParsedResumeData = z.infer<typeof resumeSchema>

// AI-facing tolerant schema: accepts `null` for optional fields and
// supplies defaults for required arrays so the model output validates.
// This is only used at the AI boundary; the rest of the app uses
// the strict `resumeSchema` above.
const nullToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((v) => (v === null ? undefined : v), schema)

// Create AI-friendly versions of the centralized schemas with null handling
const experienceAISchema = experienceSchema.transform((exp) => {
  // Apply null-to-undefined transformation to all optional fields
  const result: any = { ...exp }
  Object.keys(result).forEach((key) => {
    if (result[key] === null) {
      delete result[key]
    }
  })
  return result
})

const trainingAISchema = trainingSchema.transform((training) => {
  // Apply null-to-undefined transformation to all optional fields
  const result: any = { ...training }
  Object.keys(result).forEach((key) => {
    if (result[key] === null) {
      delete result[key]
    }
  })
  return result
})

export const resumeAISchema = z.object({
  experiences: z.preprocess(
    (v) => (v == null ? [] : v),
    z.array(experienceAISchema)
  ),
  training: z.preprocess(
    (v) => (v == null ? [] : v),
    z.array(trainingAISchema)
  ),
  skills: z.preprocess((v) => (v == null ? [] : v), z.array(z.string())),
  genres: z.preprocess((v) => (v == null ? [] : v), z.array(z.string())),
  sagAftraId: nullToUndefined(z.string().optional())
})

export type ParsedResumeAIData = z.infer<typeof resumeAISchema>

// JSON Schema equivalent (for OpenAI Responses API structured output)
// Generated from centralized validators to ensure consistency
export const resumeAIJsonSchema = {
  type: 'object',
  properties: {
    experiences: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: {
            enum: ['tv-film', 'music-video', 'live-performance', 'commercial']
          },
          title: { type: 'string' },
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          roles: { type: 'array', items: { type: 'string' } },
          artists: { type: 'array', items: { type: 'string' } },
          choreographers: { type: 'array', items: { type: 'string' } },
          associateChoreographers: { type: 'array', items: { type: 'string' } },
          directors: { type: 'array', items: { type: 'string' } },
          mainTalent: { type: 'array', items: { type: 'string' } },
          studio: { type: 'string' },
          companyName: { type: 'string' },
          productionCompany: { type: 'string' },
          tourArtist: { type: 'string' },
          venue: { type: 'string' },
          subtype: {
            enum: [
              'festival',
              'tour',
              'concert',
              'corporate',
              'award-show',
              'theater',
              'other'
            ]
          }
        },
        required: ['type'],
        additionalProperties: false
      },
      default: []
    },
    training: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: {
            enum: [
              'education',
              'dance-school',
              'programs-intensives',
              'scholarships',
              'other'
            ]
          },
          institution: { type: 'string' },
          instructors: { type: 'array', items: { type: 'string' } },
          startYear: { type: 'number' },
          endYear: { type: 'number' },
          degree: { type: 'string' }
        },
        required: ['type', 'institution'],
        additionalProperties: false
      },
      default: []
    },
    skills: { type: 'array', items: { type: 'string' }, default: [] },
    genres: { type: 'array', items: { type: 'string' }, default: [] },
    sagAftraId: { type: 'string' }
  },
  required: ['experiences', 'training', 'skills', 'genres'],
  additionalProperties: false
} as const
