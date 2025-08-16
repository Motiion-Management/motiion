'use node'

import { internalAction } from '../_generated/server'
import { internal } from '../_generated/api'
import { v } from 'convex/values'
import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { ConvexError } from 'convex/values'
import { resumeSchema, type ParsedResumeData } from './schemas'
import mammoth from 'mammoth'

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
      const metadata = await ctx.runQuery(internal.ai.fileMetadata.getFileMetadata, {
        storageId: args.storageId
      })

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
        // PDFs: Use OpenAI's native PDF support
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
        console.log(`Rate limited, retrying... (attempt ${retryCount + 1}/${maxRetries})`)
        await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 2000))
        
        return await ctx.runAction(internal.ai.documentProcessor.parseResumeDocument, {
          storageId: args.storageId,
          retryCount: retryCount + 1
        })
      }

      throw new ConvexError(`Failed to process document: ${error.message || 'Unknown error'}`)
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

// Process Word documents by extracting text
async function processWordDocument(fileUrl: string) {
  try {
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
      throw new ConvexError('No text could be extracted from the Word document')
    }

    // Process the extracted text using the cheaper text API
    const aiResult = await generateObject({
      model: openai('gpt-4o-mini'), // Cost-effective for text
      schema: resumeSchema,
      messages: [
        {
          role: 'system',
          content: createTextExtractionPrompt()
        },
        {
          role: 'user',
          content: `Please parse this resume text extracted from a Word document:\n\n${text}`
        }
      ],
      temperature: 0.1
    })

    // Convert null values to undefined for proper schema validation
    const cleanedResult = {
      ...aiResult.object,
      sagAftraId: aiResult.object.sagAftraId === null ? undefined : aiResult.object.sagAftraId
    }
    return cleanedResult
  } catch (error: any) {
    console.error('Word document processing error:', error)
    throw new ConvexError(`Failed to process Word document: ${error.message || 'Unknown error'}`)
  }
}

// Process images using Vision API
async function processImageDocument(fileUrl: string) {
  try {
    const result = await generateObject({
      model: openai('gpt-4o'), // Vision capability needed
      schema: resumeSchema,
      messages: [
        {
          role: 'system',
          content: createVisionExtractionPrompt()
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Please parse this resume image:'
            },
            {
              type: 'image',
              image: fileUrl
            }
          ]
        }
      ],
      temperature: 0.1
    })

    // Convert null values to undefined for proper schema validation
    const cleanedResult = {
      ...result.object,
      sagAftraId: result.object.sagAftraId === null ? undefined : result.object.sagAftraId
    }
    return cleanedResult
  } catch (error: any) {
    console.error('Image processing error:', error)
    throw new ConvexError(`Failed to process image: ${error.message || 'Unknown error'}`)
  }
}

// Process PDFs using OpenAI's native PDF support
async function processPdfDocument(fileUrl: string) {
  try {
    // Download the PDF file
    const response = await fetch(fileUrl)
    if (!response.ok) {
      throw new Error(`Failed to download PDF: ${response.status}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    const base64Pdf = Buffer.from(arrayBuffer).toString('base64')

    const result = await generateObject({
      model: openai('gpt-4o'), // PDF support
      schema: resumeSchema,
      messages: [
        {
          role: 'system',
          content: createVisionExtractionPrompt()
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Please parse this resume PDF:'
            },
            {
              type: 'image',
              image: `data:application/pdf;base64,${base64Pdf}`
            }
          ]
        }
      ],
      temperature: 0.1
    })

    // Convert null values to undefined for proper schema validation
    const cleanedResult = {
      ...result.object,
      sagAftraId: result.object.sagAftraId === null ? undefined : result.object.sagAftraId
    }
    return cleanedResult
  } catch (error: any) {
    console.error('PDF processing error:', error)
    throw new ConvexError(`Failed to process PDF: ${error.message || 'Unknown error'}`)
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

Extract only information that is clearly present in the text. Do not infer or assume data.`
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

Extract only information that is clearly visible in the document. Do not infer or assume data.`
}

