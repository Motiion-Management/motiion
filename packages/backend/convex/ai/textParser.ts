import { internalAction } from '../_generated/server'
import { internal } from '../_generated/api'
import { v } from 'convex/values'
import OpenAI from 'openai'
import { ConvexError } from 'convex/values'
import {
  resumeSchema,
  resumeAISchema,
  resumeAIJsonSchema,
  type ParsedResumeData
} from './schemas'
import {
  PROJECT_TYPES as EXPERIENCE_TYPES,
  LIVE_EVENT_SUBTYPES
} from '../validators/projects'
import { TRAINING_TYPES } from '../validators/training'
import {
  processAIResponse,
  createGracefulFallback,
  handleRetryableError,
  createTextExtractionPrompt
} from './shared'

export const parseResumeText = internalAction({
  args: {
    text: v.string(),
    retryCount: v.optional(v.number())
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
  handler: async (ctx, args): Promise<ParsedResumeData> => {
    const retryCount = args.retryCount || 0
    const maxRetries = 2

    try {
      if (!process.env.OPENAI_API_KEY) {
        throw new ConvexError('OpenAI API key not configured')
      }

      if (!args.text || args.text.trim().length === 0) {
        throw new ConvexError('No text provided for parsing')
      }

      const prompt = createTextExtractionPrompt()

      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      const rsp = await client.responses.create({
        model: 'gpt-4o',
        input: [
          {
            type: 'message',
            role: 'system',
            content: [{ type: 'input_text', text: prompt }]
          },
          {
            type: 'message',
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: `Please parse this resume text:\n\n${args.text}`
              }
            ]
          }
        ],
        text: { format: { type: 'json_object' } },
        temperature: 0.1
      })

      const json = rsp.output_text
      return processAIResponse(json)
    } catch (error: any) {
      console.error('Text parsing error:', error)

      if (error instanceof ConvexError) {
        throw error
      }

      return await handleRetryableError(error, retryCount, maxRetries, () =>
        ctx.runAction(internal.ai.textParser.parseResumeText, {
          text: args.text,
          retryCount: retryCount + 1
        })
      )
    }
  }
})
