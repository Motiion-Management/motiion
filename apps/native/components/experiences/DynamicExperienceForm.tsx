import React, { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { z } from 'zod';
import { ConvexDynamicForm } from '~/components/form/ConvexDynamicForm';
import { getExperienceMetadata } from '~/utils/convexFormMetadata';
import { Experience } from '~/types/experiences';
import { Text } from '~/components/ui/text';

// Import Convex validators - these might be undefined if server-only
import { zExperiencesUnified } from '@packages/backend/convex/schemas';

// Schemas are imported correctly

interface DynamicExperienceFormProps {
  experienceType: string;
  initialData?: Partial<Experience>;
  onChange: (data: Partial<Experience>) => void;
}

// Use a single discriminated union schema keyed by 'type'
const unifiedSchema: z.ZodTypeAny = zExperiencesUnified;

/**
 * Dynamic experience form that uses Convex schemas
 */
export function DynamicExperienceForm({
  experienceType,
  initialData = {},
  onChange,
}: DynamicExperienceFormProps) {
  const schema = unifiedSchema;
  const metadata = useMemo(() => getExperienceMetadata(experienceType), [experienceType]);

  if (!schema) {
    console.error(`No schema found for experience type: ${experienceType}`);

    // Return error UI instead of throwing
    return (
      <View className="rounded-lg bg-destructive/10 p-4">
        <Text className="text-destructive">
          Error: No schema found for experience type: {experienceType}
        </Text>
        <Text className="mt-2 text-sm text-text-disabled">
          The dynamic form system is not yet configured for this experience type.
        </Text>
      </View>
    );
  }

  // Map frontend type to backend type if needed
  const mapDataForBackend = useCallback((data: any) => {
    // Remove frontend-only fields
    const { type, ...backendData } = data;

    // The backend schemas don't have a 'type' field, it's determined by the table
    return backendData;
  }, []);

  // Map backend data to frontend format
  const mapDataForFrontend = useCallback(
    (data: any) => ({
      ...data,
      type: experienceType, // Add type field for frontend
    }),
    [experienceType]
  );

  return (
    <ConvexDynamicForm
      schema={schema}
      metadata={metadata}
      initialData={initialData}
      onChange={useCallback((data) => onChange(mapDataForFrontend(data)), [onChange, mapDataForFrontend])}
      exclude={['userId', 'private']} // Exclude system fields
      debounceMs={300}
    />
  );
}
