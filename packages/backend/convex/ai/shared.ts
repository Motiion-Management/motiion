import { ConvexError } from 'convex/values'
import { resumeSchema, resumeAISchema, type ParsedResumeData } from './schemas'
import { PROJECT_TYPES as EXPERIENCE_TYPES } from '../validators/projects'
import { TRAINING_TYPES } from '../validators/training'
import { trySalvageFromAIText } from './utils'

/**
 * Sanitizes AI responses by removing invalid fields and fixing common issues
 */
export function sanitizeAIResponse(
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

/**
 * Creates a graceful fallback response when all processing fails
 */
export function createGracefulFallback(): ParsedResumeData {
  return {
    experiences: [],
    training: [],
    skills: [],
    genres: [],
    sagAftraId: undefined
  }
}

/**
 * Enhanced processing function that handles AI response parsing with recovery
 */
export function processAIResponse(
  jsonText: string | undefined
): ParsedResumeData {
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

/**
 * Handles retry logic for AI API calls with exponential backoff
 */
export async function handleRetryableError(
  error: any,
  retryCount: number,
  maxRetries: number,
  retryFn: () => Promise<ParsedResumeData>
): Promise<ParsedResumeData> {
  if (error.status === 429 && retryCount < maxRetries) {
    console.log(
      `Rate limited, retrying... (attempt ${retryCount + 1}/${maxRetries})`
    )
    await new Promise((resolve) => setTimeout(resolve, (retryCount + 1) * 2000))
    return await retryFn()
  }

  if (error.status === 429) {
    throw new ConvexError(
      'Service is temporarily busy. Please try again in a few minutes.'
    )
  }

  if (error.status === 400) {
    throw new ConvexError(
      'The provided content could not be processed. Please check the file and try again.'
    )
  }

  // Check for any available response text in the error
  const text: string | undefined = error?.text || error?.response?.output_text
  if (typeof text === 'string') {
    return processAIResponse(text)
  }

  // Return graceful fallback instead of throwing
  console.log('AI processing failed completely, returning graceful fallback')
  return createGracefulFallback()
}

/**
 * Creates the standardized text extraction prompt
 */
export function createTextExtractionPrompt(): string {
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

/**
 * Creates the standardized vision extraction prompt for documents/images
 */
export function createVisionExtractionPrompt(): string {
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
