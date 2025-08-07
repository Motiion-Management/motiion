import React from 'react'
import { View } from 'react-native'
import { z } from 'zod'
import { ConvexDynamicForm } from '~/components/form/ConvexDynamicForm'
import { getExperienceMetadata } from '~/utils/convexFormMetadata'
import { Experience } from '~/types/experiences'
import { Text } from '~/components/ui/text'

// Import Convex validators - these might be undefined if server-only
import { zExperiencesTvFilm } from '@packages/backend/convex/validators/experiencesTvFilm'
import { zExperiencesMusicVideos } from '@packages/backend/convex/validators/experiencesMusicVideos'
import { zExperiencesLivePerformances } from '@packages/backend/convex/validators/experiencesLivePerformances'
import { zExperiencesCommercials } from '@packages/backend/convex/validators/experiencesCommercials'

// Schemas are imported correctly

interface DynamicExperienceFormProps {
  experienceType: string
  initialData?: Partial<Experience>
  onChange: (data: Partial<Experience>) => void
}

// Map experience types to their Convex schemas
const experienceSchemas: Record<string, z.ZodObject<any> | undefined> = {
  'tv-film': zExperiencesTvFilm,
  'television-film': zExperiencesTvFilm,
  'music-video': zExperiencesMusicVideos,
  'music-videos': zExperiencesMusicVideos,
  'live-performance': zExperiencesLivePerformances,
  'live-performances': zExperiencesLivePerformances,
  'commercial': zExperiencesCommercials,
  'commercials': zExperiencesCommercials
}

/**
 * Dynamic experience form that uses Convex schemas
 */
export function DynamicExperienceForm({
  experienceType,
  initialData = {},
  onChange
}: DynamicExperienceFormProps) {
  const schema = experienceSchemas[experienceType]
  const metadata = getExperienceMetadata(experienceType)

  if (!schema) {
    console.error(`No schema found for experience type: ${experienceType}`)
    console.error('Available schemas:', Object.keys(experienceSchemas))
    
    // Return error UI instead of throwing
    return (
      <View className="p-4 bg-destructive/10 rounded-lg">
        <Text className="text-destructive">
          Error: No schema found for experience type: {experienceType}
        </Text>
        <Text className="text-sm text-text-disabled mt-2">
          The dynamic form system is not yet configured for this experience type.
        </Text>
      </View>
    )
  }

  // Map frontend type to backend type if needed
  const mapDataForBackend = (data: any) => {
    // Remove frontend-only fields
    const { type, ...backendData } = data
    
    // The backend schemas don't have a 'type' field, it's determined by the table
    return backendData
  }

  // Map backend data to frontend format
  const mapDataForFrontend = (data: any) => {
    return {
      ...data,
      type: experienceType // Add type field for frontend
    }
  }

  return (
    <ConvexDynamicForm
      schema={schema}
      metadata={metadata}
      initialData={initialData}
      onChange={(data) => onChange(mapDataForFrontend(data))}
      exclude={['userId', 'private']} // Exclude system fields
      debounceMs={300}
    />
  )
}