'use node'

import { internalAction } from '../_generated/server'
import { internal } from '../_generated/api'
import { v } from 'convex/values'
import OpenAI from 'openai'
import { ConvexError } from 'convex/values'
import {
  validateAIEnvironment,
  validateImageAccess,
  cleanExtractedText,
  cleanStringArray,
  validateYear,
  createFallbackError
} from './utils'

const openai = new OpenAI()

// Types for structured extraction
interface ParsedExperience {
  type: 'tv-film' | 'music-video' | 'live-performance' | 'commercial'
  title?: string
  startDate?: string
  endDate?: string
  roles?: string[]
  // TV/Film specific
  studio?: string
  // Music Video specific
  artists?: string[]
  // Commercial specific
  companyName?: string
  productionCompany?: string
  // Live Performance specific
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
  // Team fields
  mainTalent?: string[]
  choreographers?: string[]
  associateChoreographers?: string[]
  directors?: string[]
}

interface ParsedTraining {
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

interface ParsedResumeData {
  experiences: ParsedExperience[]
  training: ParsedTraining[]
  skills: string[]
  genres: string[]
  sagAftraId?: string
}

export const parseResumeImage = internalAction({
  args: {
    imageStorageId: v.id('_storage'),
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
  handler: async (ctx, args) => {
    const retryCount = args.retryCount || 0
    const maxRetries = 2

    try {
      // Validate environment setup
      validateAIEnvironment()

      // Get the image URL from storage
      const imageUrl = await ctx.storage.getUrl(args.imageStorageId)
      if (!imageUrl) {
        throw new ConvexError('Image not found in storage')
      }

      // Validate image accessibility and format
      await validateImageAccess(imageUrl)

      // Create the structured prompt for resume parsing
      const prompt = `
You are an expert resume parser for entertainment industry professionals (dancers, choreographers, performers). 

Analyze this resume image and extract structured information. Focus on:

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

Return ONLY valid JSON matching this exact structure, no additional text:

{
  "experiences": [
    {
      "type": "tv-film" | "music-video" | "live-performance" | "commercial",
      "title": "Project Name",
      "startDate": "2023-01-01",
      "endDate": "2023-01-15", 
      "roles": ["Dancer", "Assistant Choreographer"],
      "studio": "Network/Studio Name",
      "artists": ["Artist Name"],
      "companyName": "Brand Name",
      "productionCompany": "Production Company",
      "tourArtist": "Tour Artist Name",
      "venue": "Venue Name",
      "subtype": "festival",
      "mainTalent": ["Celebrity Name"],
      "choreographers": ["Choreographer Name"],
      "associateChoreographers": ["Associate Name"],
      "directors": ["Director Name"]
    }
  ],
  "training": [
    {
      "type": "dance-school",
      "institution": "Institution Name",
      "instructors": ["Teacher Name"],
      "startYear": 2020,
      "endYear": 2024,
      "degree": "BFA in Dance"
    }
  ],
  "skills": ["Jazz", "Contemporary", "Hip Hop", "Ballet"],
  "genres": ["Pop", "R&B", "Musical Theater"],
  "sagAftraId": "12345678"
}
`

      // Call OpenAI Vision API with retry logic
      let response
      try {
        response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageUrl,
                    detail: 'high'
                  }
                }
              ]
            }
          ],
          max_tokens: 2000,
          temperature: 0.1 // Low temperature for consistent extraction
        })
      } catch (openaiError: any) {
        // Handle specific OpenAI errors
        if (
          openaiError.status === 400 &&
          openaiError.message?.includes('image')
        ) {
          throw new ConvexError(
            'The image format is not supported or the image is corrupted. Please try with a different image.'
          )
        } else if (openaiError.status === 429) {
          // Rate limit - retry if we haven't exceeded max retries
          if (retryCount < maxRetries) {
            console.log(
              `OpenAI rate limited, retrying... (attempt ${retryCount + 1}/${maxRetries})`
            )
            await new Promise((resolve) =>
              setTimeout(resolve, (retryCount + 1) * 2000)
            ) // Exponential backoff
            throw new ConvexError(
              'Service is temporarily busy. Please try again in a few minutes.'
            )
          } else {
            throw new ConvexError(
              'Service is temporarily busy. Please try again in a few minutes.'
            )
          }
        } else {
          throw new ConvexError(
            `AI processing failed: ${openaiError.message || 'Unknown error'}`
          )
        }
      }

      const content = response.choices[0].message.content
      if (!content) {
        throw new ConvexError('No response from OpenAI')
      }

      // Parse the JSON response with enhanced error handling
      let parsedData: ParsedResumeData
      try {
        // Clean the response to extract just the JSON
        let jsonText = content.trim()

        // Try to find JSON within markdown code blocks
        const markdownMatch = jsonText.match(
          /```(?:json)?\s*(\{[\s\S]*?\})\s*```/
        )
        if (markdownMatch) {
          jsonText = markdownMatch[1]
        } else {
          // Try to find JSON object
          const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            jsonText = jsonMatch[0]
          }
        }

        if (
          !jsonText ||
          (!jsonText.startsWith('{') && !jsonText.endsWith('}'))
        ) {
          throw new Error('No valid JSON found in response')
        }

        parsedData = JSON.parse(jsonText)

        // Validate that we got the expected structure
        if (typeof parsedData !== 'object' || parsedData === null) {
          throw new Error('Parsed data is not a valid object')
        }
      } catch (parseError) {
        console.error('Failed to parse OpenAI response:', content)
        console.error('Parse error:', parseError)

        // If parsing failed, log it and provide a helpful error message
        console.log(`JSON parsing failed after ${retryCount} attempts`)

        throw new ConvexError(
          'Could not extract structured data from your resume. The image might be unclear or in an unsupported format. Please try with a clearer image or enter information manually.'
        )
      }

      // Validate and clean the data using utility functions
      const cleanedData = {
        experiences: (parsedData.experiences || [])
          .map((exp) => ({
            ...exp,
            type: exp.type || ('tv-film' as const),
            title: cleanExtractedText(exp.title),
            startDate: cleanExtractedText(exp.startDate),
            endDate: cleanExtractedText(exp.endDate),
            roles: cleanStringArray(exp.roles || []),
            studio: cleanExtractedText(exp.studio),
            artists: cleanStringArray(exp.artists || []),
            companyName: cleanExtractedText(exp.companyName),
            productionCompany: cleanExtractedText(exp.productionCompany),
            tourArtist: cleanExtractedText(exp.tourArtist),
            venue: cleanExtractedText(exp.venue),
            subtype: exp.subtype || undefined,
            mainTalent: cleanStringArray(exp.mainTalent || []),
            choreographers: cleanStringArray(exp.choreographers || []),
            associateChoreographers: cleanStringArray(
              exp.associateChoreographers || []
            ),
            directors: cleanStringArray(exp.directors || [])
          }))
          .filter(
            (exp) =>
              exp.title ||
              exp.roles?.length ||
              exp.studio ||
              exp.artists?.length ||
              exp.companyName ||
              exp.venue
          ), // Only keep experiences with some content

        training: (parsedData.training || [])
          .map((train) => ({
            type: train.type || ('other' as const),
            institution:
              cleanExtractedText(train.institution) || 'Unknown Institution',
            instructors: cleanStringArray(train.instructors || []),
            startYear: validateYear(train.startYear),
            endYear: validateYear(train.endYear),
            degree: cleanExtractedText(train.degree)
          }))
          .filter(
            (train) =>
              train.institution && train.institution !== 'Unknown Institution'
          ), // Only keep training with valid institutions

        skills: cleanStringArray(parsedData.skills || []),
        genres: cleanStringArray(parsedData.genres || []),
        sagAftraId: cleanExtractedText(parsedData.sagAftraId)
      }

      return cleanedData
    } catch (error) {
      console.error('Resume parsing error:', error)

      // If it's already a ConvexError, re-throw it
      if (error instanceof ConvexError) {
        throw error
      }

      // Use utility function to create user-friendly error messages
      if (error instanceof Error) {
        throw createFallbackError(error)
      }

      throw new ConvexError(
        'An unexpected error occurred while processing your resume. Please try again.'
      )
    }
  }
})
