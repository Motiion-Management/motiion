import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import { View } from 'react-native';
import { useQuery } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';
import {
  headshotsFormSchema,
  type HeadshotsFormValues
} from '@packages/backend/convex/schemas/fields';

import { MultiImageUpload } from '~/components/upload';
import type { FormHandle, FormProps } from '~/components/forms/onboarding/contracts';

// Backward compatibility exports
export const headshotsSchema = headshotsFormSchema;

export interface HeadshotsValues {
  // Headshots array for validation
  // Note: MultiImageUpload component handles the actual upload
  headshots?: Array<{
    storageId: string
    title?: string
    uploadDate: string
    position?: number
  }>
}

interface HeadshotsFormProps extends FormProps<HeadshotsValues> {
  // Optional profile query for real-time headshot count
  // If not provided, will use initialValues.headshots
  profileQuery?: Array<{
    storageId: string
    title?: string
    uploadDate: string
    position?: number
  }>
}

export const HeadshotsForm = forwardRef<FormHandle, HeadshotsFormProps>(
  function HeadshotsForm({ initialValues, onSubmit, onValidChange, profileQuery }, ref) {
    // Use profileQuery if provided (for real-time updates), otherwise fall back to initialValues
    const existingHeadshots = profileQuery ?? initialValues?.headshots ?? [];
    const hasImages = (existingHeadshots?.length ?? 0) > 0;

    useImperativeHandle(ref, () => ({
      submit: () => onSubmit({}),
      isDirty: () => false,
      isValid: () => hasImages,
    }));

    useEffect(() => {
      onValidChange?.(hasImages);
    }, [hasImages, onValidChange]);

    return (
      <View className="mt-4 flex-1">
        <MultiImageUpload />
      </View>
    );
  }
);
