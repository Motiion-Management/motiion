import React, { forwardRef, useEffect, useImperativeHandle } from 'react'
import { View } from 'react-native'
import { useQuery } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'

import { MultiImageUpload } from '~/components/upload'
import type { FormHandle, FormProps } from '~/components/forms/onboarding/contracts'

export interface HeadshotsValues {
  // Headshots saved via MultiImageUpload; no fields here
}

export const HeadshotsForm = forwardRef<FormHandle, FormProps<HeadshotsValues>>(function HeadshotsForm(
  { onSubmit, onValidChange },
  ref
) {
  const existingHeadshots = useQuery(api.users.headshots.getMyHeadshots)
  const hasImages = (existingHeadshots?.length ?? 0) > 0

  useImperativeHandle(ref, () => ({
    submit: () => onSubmit({}),
    isDirty: () => false,
    isValid: () => hasImages,
  }))

  useEffect(() => {
    onValidChange?.(hasImages)
  }, [hasImages, onValidChange])

  return (
    <View className="mt-4 flex-1">
      <MultiImageUpload />
    </View>
  )
})

