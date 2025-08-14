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
 * Sanitizes and validates image file types
 */
export function isValidImageType(mimeType: string | undefined): boolean {
  if (!mimeType) return false

  const validTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/heic',
    'image/heif',
    'image/webp'
  ]

  return validTypes.includes(mimeType.toLowerCase())
}

/**
 * Checks if an image URL is accessible
 */
export async function validateImageAccess(imageUrl: string): Promise<void> {
  try {
    const response: any = await fetch(imageUrl, {
      method: 'HEAD'
    })

    if (!response.ok) {
      throw new ConvexError('Image is not accessible')
    }

    const contentType = response.headers?.get?.('content-type')
    if (!isValidImageType(contentType || undefined)) {
      throw new ConvexError(
        'Invalid image format. Please use JPEG, PNG, HEIC, or WebP format.'
      )
    }

    const contentLength = response.headers?.get?.('content-length')
    if (contentLength) {
      const sizeMB = parseInt(contentLength) / (1024 * 1024)
      if (sizeMB > 20) {
        // 20MB limit
        throw new ConvexError(
          'Image is too large. Please use an image smaller than 20MB.'
        )
      }
    }
  } catch (error) {
    if (error instanceof ConvexError) {
      throw error
    }
    throw new ConvexError('Could not access image for processing')
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

  if (message.includes('image') && message.includes('format')) {
    return new ConvexError(
      'The image format is not supported. Please try with a JPEG or PNG image.'
    )
  }

  if (message.includes('size') || message.includes('large')) {
    return new ConvexError(
      'The image is too large. Please try with a smaller image.'
    )
  }

  if (message.includes('network') || message.includes('connection')) {
    return new ConvexError(
      'Network error. Please check your connection and try again.'
    )
  }

  return new ConvexError(
    'Could not process your resume. Please try with a clearer image or enter information manually.'
  )
}
