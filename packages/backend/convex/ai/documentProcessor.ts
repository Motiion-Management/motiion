'use node'

import { internalAction } from '../_generated/server'
import { internal } from '../_generated/api'
import OpenAI from 'openai'
import { ConvexError } from 'convex/values'
import { zInternalAction } from '@packages/zodvex'
import { z } from 'zod'
import { zid } from 'convex-helpers/server/zodV4'
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
import mammoth from 'mammoth'
import {
  processAIResponse,
  createGracefulFallback,
  handleRetryableError,
  createTextExtractionPrompt,
  createVisionExtractionPrompt
} from './shared'

export const parseResumeDocument = zInternalAction(
  internalAction,
  {
    storageId: zid('_storage'),
    retryCount: z.number().optional()
  },
  async (ctx, args): Promise<ParsedResumeData> => {
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
      const metadata: { contentType?: string } | null = await ctx.runQuery(
        // @ts-expect-error - Type instantiation is excessively deep
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

      return await handleRetryableError(error, retryCount, maxRetries, () =>
        ctx.runAction(internal.ai.documentProcessor.parseResumeDocument, {
          storageId: args.storageId,
          retryCount: retryCount + 1
        })
      )
    }
  },
  { returns: resumeSchema }
)

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

// Process Word documents by extracting text with Mammoth
async function processWordDocument(fileUrl: string) {
  try {
    // Download the file
    const response = await fetch(fileUrl)
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.status}`)
    }

    const arrayBuffer = await response.arrayBuffer()

    // Convert ArrayBuffer to Buffer for Node.js
    const buffer = Buffer.from(arrayBuffer)

    // Extract text using Mammoth (Node.js API)
    const result = await mammoth.extractRawText({ buffer })
    const text = result.value

    if (!text || text.trim().length === 0) {
      throw new Error('No text could be extracted from the Word document')
    }

    // Process the extracted text using OpenAI
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const rsp = await client.responses.create({
      model: 'gpt-4o',
      input: [
        {
          type: 'message',
          role: 'system',
          content: [{ type: 'input_text', text: createTextExtractionPrompt() }]
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
  } catch (error: any) {
    console.error('Word document processing error:', error)
    return await handleRetryableError(error, 0, 0, async () =>
      createGracefulFallback()
    )
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
    return await handleRetryableError(error, 0, 0, async () =>
      createGracefulFallback()
    )
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
    return await handleRetryableError(error, 0, 0, async () =>
      createGracefulFallback()
    )
  }
}
