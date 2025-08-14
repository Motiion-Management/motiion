import { ConvexError } from 'convex/values'

/**
 * Validates that required environment variables are set for AI functionality
 */
export function validateAIEnvironment(): void {
  if (!process.env.OPENAI_API_KEY) {
    throw new ConvexError(
      'AI resume parsing is not configured. Please contact support.'
    )
  }
}

/**
 * Validates resume asset types (images and PDFs)
 */
export function isValidResumeFileType(mimeType: string | undefined): boolean {
  if (!mimeType) return false
  const mt = mimeType.toLowerCase()
  if (mt === 'application/pdf') return true
  return (
    mt === 'image/jpeg' ||
    mt === 'image/jpg' ||
    mt === 'image/png' ||
    mt === 'image/heic' ||
    mt === 'image/heif' ||
    mt === 'image/webp'
  )
}

/**
 * Checks if a remote file URL is accessible and of a supported type.
 * Returns the resolved content-type header if valid.
 */
export async function validateFileAccess(fileUrl: string): Promise<string> {
  try {
    const response: any = await fetch(fileUrl, {
      method: 'HEAD'
    })

    if (!response.ok) {
      throw new ConvexError('File is not accessible')
    }

    const contentType = response.headers?.get?.('content-type')
    if (!isValidResumeFileType(contentType || undefined)) {
      throw new ConvexError('Invalid file format. Please use JPEG, PNG, HEIC, WebP, or PDF.')
    }

    const contentLength = response.headers?.get?.('content-length')
    if (contentLength) {
      const sizeMB = parseInt(contentLength) / (1024 * 1024)
      if (sizeMB > 20) {
        // 20MB limit
        throw new ConvexError('File is too large. Please upload a file smaller than 20MB.')
      }
    }

    return (contentType || '').toLowerCase()
  } catch (error) {
    if (error instanceof ConvexError) {
      throw error
    }
    throw new ConvexError('Could not access file for processing')
  }
}

/**
 * Cleans and validates extracted text data
 */
export function cleanExtractedText(
  text: string | undefined
): string | undefined {
  if (!text || typeof text !== 'string') return undefined

  const cleaned = text
    .trim()
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[^\w\s\-.,()]/g, '') // Remove special characters except basic punctuation

  return cleaned.length > 0 ? cleaned : undefined
}

/**
 * Validates and cleans an array of strings
 */
export function cleanStringArray(arr: any[]): string[] {
  if (!Array.isArray(arr)) return []

  return arr
    .filter((item) => typeof item === 'string' && item.trim().length > 0)
    .map((item) => cleanExtractedText(item))
    .filter(Boolean) as string[]
}

/**
 * Validates year values
 */
export function validateYear(year: any): number | undefined {
  if (
    typeof year === 'number' &&
    year >= 1950 &&
    year <= new Date().getFullYear() + 5
  ) {
    return year
  }
  if (typeof year === 'string') {
    const parsed = parseInt(year, 10)
    if (
      !isNaN(parsed) &&
      parsed >= 1950 &&
      parsed <= new Date().getFullYear() + 5
    ) {
      return parsed
    }
  }
  return undefined
}

/**
 * Creates a user-friendly error message for AI parsing failures
 */
export function createFallbackError(originalError: Error): ConvexError<any> {
  const message = originalError.message.toLowerCase()

  if (message.includes('rate limit') || message.includes('quota')) {
    return new ConvexError(
      'AI service is temporarily busy. Please try again in a few minutes.'
    )
  }

  if ((message.includes('image') || message.includes('file')) && message.includes('format')) {
    return new ConvexError(
      'The file format is not supported. Please try with a JPEG/PNG image or a PDF.'
    )
  }

  if (message.includes('size') || message.includes('large')) {
    return new ConvexError('The file is too large. Please try with a smaller file.')
  }

  if (message.includes('network') || message.includes('connection')) {
    return new ConvexError(
      'Network error. Please check your connection and try again.'
    )
  }

  return new ConvexError(
    'Could not process your resume. Please try with a clearer image/PDF or enter information manually.'
  )
}
