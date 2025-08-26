import { api } from '@packages/backend/convex/_generated/api'
import { useQuery } from 'convex/react'
import React, { forwardRef, useEffect } from 'react'
import { View } from 'react-native'

import { MultiImageUpload } from '~/components/upload'

import { BaseOnboardingForm } from './BaseOnboardingForm'
import { OnboardingFormProps, OnboardingFormRef } from './types'

export interface HeadshotsFormData {
  headshots: any[]
}

export const HeadshotsForm = forwardRef<OnboardingFormRef, OnboardingFormProps<HeadshotsFormData>>(
  ({ initialData, onComplete, onCancel, mode = 'fullscreen', onValidationChange }, ref) => {
    const existingHeadshots = useQuery(api.users.headshots.getMyHeadshots)
    const hasImages = (existingHeadshots?.length ?? 0) > 0

    // Notify parent of validation state changes
    useEffect(() => {
      onValidationChange?.(hasImages)
    }, [hasImages, onValidationChange])

    const handleSubmit = async () => {
      // The images are already saved via MultiImageUpload
      await onComplete({ headshots: existingHeadshots || [] })
    }

    return (
      <BaseOnboardingForm
        ref={ref}
        title="Headshots"
        description="Upload your professional headshots to showcase your look."
        canProgress={hasImages}
        mode={mode}
        onCancel={onCancel}
        onSubmit={handleSubmit}>
        
        <View className="mt-4 flex-1">
          <MultiImageUpload />
        </View>
      </BaseOnboardingForm>
    )
  }
)

HeadshotsForm.displayName = 'HeadshotsForm'