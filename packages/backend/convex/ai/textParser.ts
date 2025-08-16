import { internalAction } from '../_generated/server'
import { internal } from '../_generated/api'
import { v } from 'convex/values'
import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { ConvexError } from 'convex/values'
import { resumeSchema, type ParsedResumeData } from './schemas'

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

      const prompt = `You are an expert resume parser for entertainment industry professionals (dancers, choreographers, performers).

Analyze this resume text and extract structured information. Focus on:

1. **Experiences** - Categorize each work experience as one of:
   - "tv-film": Television shows, movies, films, series
   - "music-video": Music videos, artist collaborations  
   - "live-performance": Tours, concerts, festivals, live shows, theater
   - "commercial": Commercials, brand campaigns, advertising

2. **Training** - Educational background, dance schools, programs:
   - "education": Formal education (university, college, degree programs)
   - "dance-school": Dance studios, conservatories, academies
   - "programs-intensives": Summer programs, workshops, intensives
   - "scholarships": Scholarship programs
   - "other": Other training not fitting above categories

3. **Skills** - Dance styles, movement techniques, special abilities
4. **Genres** - Music genres, dance styles, performance categories  
5. **SAG-AFTRA ID** - Union membership number if mentioned

For experiences, extract:
- Title/project name
- Dates (in YYYY-MM-DD format if possible, or just year)
- Role(s) performed
- Key collaborators (artists, choreographers, directors, main talent)
- Venue/studio/company information

Extract only information that is clearly present in the text. Do not infer or assume data.`

      const result = await generateObject({
        model: openai('gpt-4o-mini'), // Cost-effective for text processing
        schema: resumeSchema,
        prompt,
        messages: [
          {
            role: 'user',
            content: `Please parse this resume text:\n\n${args.text}`
          }
        ],
        temperature: 0.1 // Low temperature for consistent extraction
      })

      // Convert null values to undefined for proper schema validation
      const cleanedResult = {
        ...result.object,
        sagAftraId: result.object.sagAftraId === null ? undefined : result.object.sagAftraId
      }
      return cleanedResult
    } catch (error: any) {
      console.error('Text parsing error:', error)

      if (error instanceof ConvexError) {
        throw error
      }

      // Handle AI SDK specific errors
      if (error.status === 429) {
        if (retryCount < maxRetries) {
          console.log(`Rate limited, retrying... (attempt ${retryCount + 1}/${maxRetries})`)
          await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 2000))
          
          // Recursive retry
          return await ctx.runAction(internal.ai.textParser.parseResumeText, {
            text: args.text,
            retryCount: retryCount + 1
          })
        }
        throw new ConvexError('Service is temporarily busy. Please try again in a few minutes.')
      }

      if (error.status === 400) {
        throw new ConvexError('The provided text could not be processed. Please check the content and try again.')
      }

      throw new ConvexError(`Failed to parse resume text: ${error.message || 'Unknown error'}`)
    }
  }
})