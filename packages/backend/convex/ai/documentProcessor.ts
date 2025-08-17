'use node'

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
  EXPERIENCE_TYPES,
  LIVE_EVENT_SUBTYPES
} from '../validators/experiences'
import { TRAINING_TYPES } from '../validators/training'
import mammoth from 'mammoth'
import { trySalvageFromAIText } from './utils'

// Helper function to sanitize AI responses by removing invalid fields
function sanitizeAIResponse(
  rawResponse: any,
  aiSchema: any
): ParsedResumeData | null {
  try {
    // First, try to validate the full response
    const fullValidation = aiSchema.safeParse(rawResponse)
    if (fullValidation.success) {
      return fullValidation.data
    }

    console.log('Full validation failed, attempting field-level recovery...')

    // Create a copy to work with
    const sanitizedResponse = { ...rawResponse }

    // Ensure required array fields exist
    if (!Array.isArray(sanitizedResponse.experiences)) {
      sanitizedResponse.experiences = []
    }
    if (!Array.isArray(sanitizedResponse.training)) {
      sanitizedResponse.training = []
    }
    if (!Array.isArray(sanitizedResponse.skills)) {
      sanitizedResponse.skills = []
    }
    if (!Array.isArray(sanitizedResponse.genres)) {
      sanitizedResponse.genres = []
    }

    // Fix common field name issues
    if (sanitizedResponse['SAG-AFTRA ID'] && !sanitizedResponse.sagAftraId) {
      sanitizedResponse.sagAftraId = sanitizedResponse['SAG-AFTRA ID']
      delete sanitizedResponse['SAG-AFTRA ID']
    }

    // Sanitize experiences array
    if (Array.isArray(sanitizedResponse.experiences)) {
      sanitizedResponse.experiences = sanitizedResponse.experiences
        .map((exp: any) => {
          const cleanExp = { ...exp }

          // Remove invalid fields that aren't in our schema
          const validExpFields = [
            'type',
            'title',
            'startDate',
            'endDate',
            'roles',
            'studio',
            'artists',
            'companyName',
            'productionCompany',
            'tourArtist',
            'venue',
            'subtype',
            'mainTalent',
            'choreographers',
            'associateChoreographers',
            'directors'
          ]

          Object.keys(cleanExp).forEach((key) => {
            if (!validExpFields.includes(key)) {
              delete cleanExp[key]
            }
          })

          // Ensure required type field exists and is valid
          if (!cleanExp.type || !EXPERIENCE_TYPES.includes(cleanExp.type)) {
            return null // Invalid experience
          }

          return cleanExp
        })
        .filter(Boolean) // Remove null experiences
    }

    // Sanitize training array
    if (Array.isArray(sanitizedResponse.training)) {
      sanitizedResponse.training = sanitizedResponse.training
        .map((training: any) => {
          const cleanTraining = { ...training }

          // Remove invalid fields
          const validTrainingFields = [
            'type',
            'institution',
            'instructors',
            'startYear',
            'endYear',
            'degree'
          ]
          Object.keys(cleanTraining).forEach((key) => {
            if (!validTrainingFields.includes(key)) {
              delete cleanTraining[key]
            }
          })

          // Ensure required fields and valid type
          if (
            !cleanTraining.type ||
            !TRAINING_TYPES.includes(cleanTraining.type) ||
            !cleanTraining.institution
          ) {
            return null // Invalid training entry
          }

          return cleanTraining
        })
        .filter(Boolean)
    }

    // Try validation again after sanitization
    const sanitizedValidation = aiSchema.safeParse(sanitizedResponse)
    if (sanitizedValidation.success) {
      console.log('Field-level recovery successful')
      return sanitizedValidation.data
    }

    console.log('Field-level recovery failed:', sanitizedValidation.error)
    return null
  } catch (error) {
    console.error('Error during response sanitization:', error)
    return null
  }
}

// Helper function to create graceful fallback response
function createGracefulFallback(): ParsedResumeData {
  return {
    experiences: [],
    training: [],
    skills: [],
    genres: [],
    sagAftraId: undefined
  }
}

// Enhanced processing function that handles AI response parsing with recovery
function processAIResponse(jsonText: string | undefined): ParsedResumeData {
  if (!jsonText || jsonText.trim().length === 0) {
    console.log('Empty AI response, returning graceful fallback')
    return createGracefulFallback()
  }

  try {
    const rawResponse = JSON.parse(jsonText)

    // Try sanitization and validation
    const sanitizedData = sanitizeAIResponse(rawResponse, resumeAISchema)
    if (sanitizedData) {
      return sanitizedData
    }

    // If sanitization fails, try the existing salvage method
    console.log('Sanitization failed, trying salvage method...')
    const salvaged = trySalvageFromAIText<ParsedResumeData>(
      jsonText,
      resumeSchema
    )
    if (salvaged) {
      return salvaged
    }

    // Final fallback - return empty structure
    console.log('All recovery methods failed, returning graceful fallback')
    return createGracefulFallback()
  } catch (parseError) {
    console.error('JSON parsing failed:', parseError)

    // Try salvage on the raw text
    const salvaged = trySalvageFromAIText<ParsedResumeData>(
      jsonText,
      resumeSchema
    )
    if (salvaged) {
      return salvaged
    }

    return createGracefulFallback()
  }
}

export const parseResumeDocument = internalAction({
  args: {
    storageId: v.id('_storage'),
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

      // Get file from storage
      const fileUrl = await ctx.storage.getUrl(args.storageId)
      if (!fileUrl) {
        throw new ConvexError('File not found in storage')
      }

      // Get file metadata using system query
      const metadata = await ctx.runQuery(
        internal.ai.fileMetadata.getFileMetadata,
        {
          storageId: args.storageId
        }
      )

      if (!metadata) {
        throw new ConvexError('File metadata not found')
      }

      const contentType = metadata.contentType || ''
      const fileName = fileUrl.split('/').pop() || ''

      // Determine processing strategy based on file type
      if (isWordDocument(contentType, fileName)) {
        // Word documents: Extract text with Mammoth, then process via text API
        return await processWordDocument(fileUrl)
      } else if (isImageFile(contentType, fileName)) {
        // Images: Use Vision API
        return await processImageDocument(fileUrl)
      } else if (isPdfFile(contentType, fileName)) {
        // PDFs: Use OpenAI Responses API with input_file
        return await processPdfDocument(fileUrl)
      } else {
        throw new ConvexError(
          `Unsupported file type: ${contentType}. Supported formats: images (PNG, JPG), PDFs, and Word documents.`
        )
      }
    } catch (error: any) {
      console.error('Document processing error:', error)

      if (error instanceof ConvexError) {
        throw error
      }

      if (error.status === 429 && retryCount < maxRetries) {
        console.log(
          `Rate limited, retrying... (attempt ${retryCount + 1}/${maxRetries})`
        )
        await new Promise((resolve) =>
          setTimeout(resolve, (retryCount + 1) * 2000)
        )

        return await ctx.runAction(
          internal.ai.documentProcessor.parseResumeDocument,
          {
            storageId: args.storageId,
            retryCount: retryCount + 1
          }
        )
      }

      throw new ConvexError(
        `Failed to process document: ${error.message || 'Unknown error'}`
      )
    }
  }
})

// Helper function to determine if file is a Word document
function isWordDocument(contentType: string, fileName: string): boolean {
  return (
    contentType.includes('wordprocessingml') ||
    contentType.includes('msword') ||
    fileName.toLowerCase().endsWith('.docx') ||
    fileName.toLowerCase().endsWith('.doc')
  )
}

// Helper function to determine if file is an image
function isImageFile(contentType: string, fileName: string): boolean {
  return (
    contentType.includes('image/') ||
    /\.(png|jpg|jpeg|gif|webp)$/i.test(fileName)
  )
}

// Helper function to determine if file is a PDF
function isPdfFile(contentType: string, fileName: string): boolean {
  return (
    contentType.includes('application/pdf') ||
    fileName.toLowerCase().endsWith('.pdf')
  )
}

// Process Word documents using OpenAI's direct file support
async function processWordDocument(fileUrl: string) {
  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const rsp = await client.responses.create({
      model: 'gpt-4o',
      input: [
        {
          type: 'message',
          role: 'system',
          content: [
            { type: 'input_text', text: createVisionExtractionPrompt() }
          ]
        },
        {
          type: 'message',
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: 'Please parse this resume Word document:'
            },
            { type: 'input_file', file_url: fileUrl }
          ]
        }
      ],
      text: {
        format: { type: 'json_object' }
      },
      temperature: 0.1
    })

    const json = rsp.output_text
    return processAIResponse(json)
  } catch (error: any) {
    console.error('Word document processing error:', error)

    // Try fallback with Mammoth text extraction if OpenAI direct processing fails
    try {
      console.log('Attempting fallback with Mammoth text extraction...')

      // Download the file
      const response = await fetch(fileUrl)
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.status}`)
      }

      const arrayBuffer = await response.arrayBuffer()

      // Extract text using Mammoth
      const result = await mammoth.extractRawText({ arrayBuffer })
      const text = result.value

      if (!text || text.trim().length === 0) {
        throw new Error('No text could be extracted from the Word document')
      }

      // Process the extracted text using text API
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      const rsp = await client.responses.create({
        model: 'gpt-4o',
        input: [
          {
            type: 'message',
            role: 'system',
            content: [
              { type: 'input_text', text: createTextExtractionPrompt() }
            ]
          },
          {
            type: 'message',
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: `Please parse this resume text extracted from a Word document:\n\n${text}`
              }
            ]
          }
        ],
        text: {
          format: { type: 'json_object' }
        },
        temperature: 0.1
      })

      const json = rsp.output_text
      return processAIResponse(json)
    } catch (fallbackError: any) {
      console.error('Mammoth fallback also failed:', fallbackError)

      // Check for any available response text
      const textOut: string | undefined =
        error?.text ||
        error?.response?.output_text ||
        fallbackError?.text ||
        fallbackError?.response?.output_text
      if (typeof textOut === 'string') {
        return processAIResponse(textOut)
      }

      // Return graceful fallback instead of throwing
      console.log(
        'Word document processing failed completely, returning graceful fallback'
      )
      return createGracefulFallback()
    }
  }
}

// Process images using Vision API
async function processImageDocument(fileUrl: string) {
  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const rsp = await client.responses.create({
      model: 'gpt-4o',
      input: [
        {
          type: 'message',
          role: 'system',
          content: [
            { type: 'input_text', text: createVisionExtractionPrompt() }
          ]
        },
        {
          type: 'message',
          role: 'user',
          content: [
            { type: 'input_text', text: 'Please parse this resume image:' },
            { type: 'input_image', image_url: fileUrl, detail: 'auto' }
          ]
        }
      ],
      text: {
        format: { type: 'json_object' }
      },
      temperature: 0.1
    })

    const json = rsp.output_text
    return processAIResponse(json)
  } catch (error: any) {
    console.error('Image processing error:', error)
    const text: string | undefined = error?.text || error?.response?.output_text
    if (typeof text === 'string') {
      return processAIResponse(text)
    }
    // Return graceful fallback instead of throwing
    console.log('Image processing failed, returning graceful fallback')
    return createGracefulFallback()
  }
}

// Process PDFs using OpenAI's native PDF support
async function processPdfDocument(fileUrl: string) {
  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const rsp = await client.responses.create({
      model: 'gpt-4o',
      input: [
        {
          type: 'message',
          role: 'system',
          content: [
            { type: 'input_text', text: createVisionExtractionPrompt() }
          ]
        },
        {
          type: 'message',
          role: 'user',
          content: [
            { type: 'input_text', text: 'Please parse this resume PDF:' },
            { type: 'input_file', file_url: fileUrl }
          ]
        }
      ],
      text: {
        format: { type: 'json_object' }
      },
      temperature: 0.1
    })

    const json = rsp.output_text
    return processAIResponse(json)
  } catch (error: any) {
    console.error('PDF processing error:', error)
    const text: string | undefined = error?.text || error?.response?.output_text
    if (typeof text === 'string') {
      return processAIResponse(text)
    }
    // Return graceful fallback instead of throwing
    console.log('PDF processing failed, returning graceful fallback')
    return createGracefulFallback()
  }
}

function createTextExtractionPrompt() {
  return `You are an expert resume parser for entertainment industry professionals (dancers, choreographers, performers).

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

**CRITICAL Field Requirements:**
- ALWAYS include ALL required fields: "experiences", "training", "skills", "genres", and optionally "sagAftraId"
- Use "sagAftraId" as the field name (not "SAG-AFTRA ID")
- Extract "roles" as an array of strings (e.g., ["Dancer", "Choreographer"]), not "role"
- Extract "artists" as an array of strings (e.g., ["Justin Bieber", "Ariana Grande"]), not "artist"
- Extract "choreographers" as an array of strings (e.g., ["Tucker Barkley"]), not "choreographer"
- Extract "instructors" as an array of strings for training, not "instructor"
- All array fields should contain arrays even if there's only one item

**Example JSON structure:**
{
  "experiences": [...],
  "training": [...],
  "skills": ["Hip Hop", "Jazz", "Contemporary"],
  "genres": ["Pop", "R&B", "Hip Hop"],
  "sagAftraId": "1234567890"
}

Output rules:
- Do not output null values. If a field is unknown, omit the key entirely.
- For required array fields (experiences, training, skills, genres), ALWAYS include them - use empty arrays when no items are present.
- Use the exact enum labels for types as specified above.
- Extract only information that is clearly present in the text. Do not infer or assume data.
- Return the extracted information in valid JSON format.`
}

function createVisionExtractionPrompt() {
  return `You are an expert resume parser for entertainment industry professionals (dancers, choreographers, performers).

Analyze this resume document and extract structured information. Focus on:

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

**CRITICAL Field Requirements:**
- ALWAYS include ALL required fields: "experiences", "training", "skills", "genres", and optionally "sagAftraId"
- Use "sagAftraId" as the field name (not "SAG-AFTRA ID")
- Extract "roles" as an array of strings (e.g., ["Dancer", "Choreographer"]), not "role"
- Extract "artists" as an array of strings (e.g., ["Justin Bieber", "Ariana Grande"]), not "artist"
- Extract "choreographers" as an array of strings (e.g., ["Tucker Barkley"]), not "choreographer"
- Extract "instructors" as an array of strings for training, not "instructor"
- All array fields should contain arrays even if there's only one item

**Example JSON structure:**
{
  "experiences": [...],
  "training": [...],
  "skills": ["Hip Hop", "Jazz", "Contemporary"],
  "genres": ["Pop", "R&B", "Hip Hop"],
  "sagAftraId": "1234567890"
}

Output rules:
- Do not output null values. If a field is unknown, omit the key entirely.
- For required array fields (experiences, training, skills, genres), ALWAYS include them - use empty arrays when no items are present.
- Use the exact enum labels for types as specified above.
- Extract only information that is clearly visible in the document. Do not infer or assume data.
- Return the extracted information in valid JSON format.`
}
