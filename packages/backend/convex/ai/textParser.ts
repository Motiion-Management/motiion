import { internal } from '../_generated/api'
import { z } from 'zod'
import { zia } from '../util'
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
} from '../schemas/projects'
import { TRAINING_TYPES } from '../schemas/training'
import {
  processAIResponse,
  createGracefulFallback,
  handleRetryableError,
  createTextExtractionPrompt
} from './shared'

export const parseResumeText = zia({
  args: {
    text: z.string(),
    retryCount: z.number().optional()
  },
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
  },
  returns: resumeSchema
})
