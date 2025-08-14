import { authMutation, authQuery, authAction } from '../util'
import { v } from 'convex/values'
import { internal } from '../_generated/api'
import { ConvexError } from 'convex/values'
import { Id } from '../_generated/dataModel'
import OpenAI from 'openai'
import {
  validateAIEnvironment,
  cleanExtractedText,
  cleanStringArray,
  validateYear
} from '../ai/utils'

const openai = new OpenAI()

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

// Parse text directly into structured resume data
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
  handler: async (ctx, args) => {
    'use node'
    validateAIEnvironment()

    const rawText = (args.text || '').trim()
    if (!rawText || rawText.length < 20) {
      throw new ConvexError('No readable text found in the document.')
    }

    const prompt = `
You are an expert resume parser for entertainment industry professionals (dancers, choreographers, performers).

Analyze the following resume text and extract structured information. Focus on:

1. Experiences — one of: "tv-film", "music-video", "live-performance", "commercial"
2. Training — one of: "education", "dance-school", "programs-intensives", "scholarships", "other"
3. Skills, Genres, SAG-AFTRA ID

Return ONLY valid JSON matching this structure with optional fields omitted when unknown:
{
  "experiences": [
    {
      "type": "tv-film" | "music-video" | "live-performance" | "commercial",
      "title": string,
      "startDate": string,
      "endDate": string,
      "roles": string[],
      "studio": string,
      "artists": string[],
      "companyName": string,
      "productionCompany": string,
      "tourArtist": string,
      "venue": string,
      "subtype": "festival" | "tour" | "concert" | "corporate" | "award-show" | "theater" | "other",
      "mainTalent": string[],
      "choreographers": string[],
      "associateChoreographers": string[],
      "directors": string[]
    }
  ],
  "training": [
    {
      "type": "education" | "dance-school" | "programs-intensives" | "scholarships" | "other",
      "institution": string,
      "instructors": string[],
      "startYear": number,
      "endYear": number,
      "degree": string
    }
  ],
  "skills": string[],
  "genres": string[],
  "sagAftraId": string
}

Resume text:
"""
${rawText}
"""
`

    let response
    try {
      response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.1
      })
    } catch (e: any) {
      throw new ConvexError(
        `AI processing failed: ${e?.message || 'Unknown error'}`
      )
    }

    const content = response.choices[0].message.content
    if (!content) throw new ConvexError('No response from AI service')

    // Parse JSON from response
    let parsedData: any
    try {
      let jsonText = content.trim()
      const markdownMatch = jsonText.match(
        /```(?:json)?\s*(\{[\s\S]*?\})\s*```/
      )
      if (markdownMatch) jsonText = markdownMatch[1]
      else {
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
        if (jsonMatch) jsonText = jsonMatch[0]
      }
      if (!jsonText.startsWith('{') || !jsonText.endsWith('}'))
        throw new Error('No valid JSON found')
      parsedData = JSON.parse(jsonText)
    } catch (err) {
      console.error('Failed to parse AI response:', content)
      throw new ConvexError(
        'Could not extract structured data. Please try a clearer document or enter details manually.'
      )
    }

    // Clean and validate using existing utils
    const cleaned = {
      experiences: (parsedData.experiences || [])
        .map((exp: any) => ({
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
          (exp: any) =>
            exp.title ||
            exp.roles?.length ||
            exp.studio ||
            exp.artists?.length ||
            exp.companyName ||
            exp.venue
        ),
      training: (parsedData.training || [])
        .map((t: any) => ({
          type: t.type || ('other' as const),
          institution:
            cleanExtractedText(t.institution) || 'Unknown Institution',
          instructors: cleanStringArray(t.instructors || []),
          startYear: validateYear(t.startYear),
          endYear: validateYear(t.endYear),
          degree: cleanExtractedText(t.degree)
        }))
        .filter(
          (t: any) => t.institution && t.institution !== 'Unknown Institution'
        ),
      skills: cleanStringArray(parsedData.skills || []),
      genres: cleanStringArray(parsedData.genres || []),
      sagAftraId: cleanExtractedText(parsedData.sagAftraId)
    }

    return cleaned
  }
})
