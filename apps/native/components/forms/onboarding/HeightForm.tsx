import { api } from '@packages/backend/convex/_generated/api'
import { useMutation, useQuery } from 'convex/react'
import React, { forwardRef, useState, useCallback, useEffect, useMemo } from 'react'
import { View } from 'react-native'

import { HeightPicker, HeightValue } from '~/components/ui/height-picker'
import { Text } from '~/components/ui/text'

import { BaseOnboardingForm } from './BaseOnboardingForm'
import { OnboardingFormProps, OnboardingFormRef } from './types'

export interface HeightFormData {
  height: HeightValue
}

export const HeightForm = forwardRef<OnboardingFormRef, OnboardingFormProps<HeightFormData>>(
  ({ initialData, onComplete, onCancel, mode = 'fullscreen', onValidationChange }, ref) => {
    const user = useQuery(api.users.getMyUser)
    const patchUserAttributes = useMutation(api.users.patchUserAttributes)

    const [height, setHeight] = useState<HeightValue>(
      initialData?.height || user?.attributes?.height || { feet: 5, inches: 6 }
    )
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Load existing height from user profile if no initial data
    useEffect(() => {
      if (!initialData?.height && user?.attributes?.height) {
        setHeight(user.attributes.height)
      }
    }, [user?.attributes?.height, initialData?.height])

    const validateHeight = useCallback((heightValue: HeightValue): boolean => {
      // Basic validation - ensure reasonable height range
      if (heightValue.feet < 3 || heightValue.feet > 7) {
        setError('Height must be between 3 and 7 feet')
        return false
      }

      if (heightValue.inches < 0 || heightValue.inches > 11) {
        setError('Inches must be between 0 and 11')
        return false
      }

      // Check minimum height (3'0")
      const totalInches = heightValue.feet * 12 + heightValue.inches
      if (totalInches < 36) {
        setError('Height must be at least 3 feet')
        return false
      }

      // Check maximum height (7'11")
      if (totalInches > 95) {
        setError('Height cannot exceed 7 feet 11 inches')
        return false
      }

      setError(null)
      return true
    }, [])

    const handleHeightChange = useCallback((newHeight: HeightValue) => {
      setHeight(newHeight)
      // Clear any existing errors when user changes height
      setError(null)
    }, [])

    const formatHeight = useCallback((heightValue: HeightValue): string => {
      return `${heightValue.feet}'${heightValue.inches}"`
    }, [])

    const handleSubmit = useCallback(async () => {
      if (!validateHeight(height)) {
        return
      }

      setIsSubmitting(true)
      setError(null)

      try {
        await patchUserAttributes({
          attributes: { height },
        })

        await onComplete({ height })
      } catch (err) {
        console.error('Error updating height:', err)
        setError('Failed to save height. Please try again.')
        throw err
      } finally {
        setIsSubmitting(false)
      }
    }, [height, validateHeight, patchUserAttributes, onComplete])

    // Compute validation state without side effects
    const isValid = useMemo(() => {
      // Basic validation - ensure reasonable height range
      if (height.feet < 3 || height.feet > 7) return false
      if (height.inches < 0 || height.inches > 11) return false
      
      // Check minimum height (3'0") and maximum height (7'11")
      const totalInches = height.feet * 12 + height.inches
      if (totalInches < 36 || totalInches > 95) return false
      
      return true
    }, [height])

    // Notify parent of validation state changes
    useEffect(() => {
      onValidationChange?.(isValid && !isSubmitting)
    }, [isValid, isSubmitting, onValidationChange])

    return (
      <BaseOnboardingForm
        ref={ref}
        title="How tall are you?"
        description="Select height"
        canProgress={isValid && !isSubmitting}
        mode={mode}
        onCancel={onCancel}
        onSubmit={handleSubmit}>
        <HeightPicker value={height} onChange={handleHeightChange} />

        <View className="items-center mt-4">
          <Text className="text-text-low text-lg">{formatHeight(height)}</Text>
        </View>

        {error && (
          <View className="mt-4 px-4">
            <Text className="text-center text-red-500">{error}</Text>
          </View>
        )}
      </BaseOnboardingForm>
    )
  }
)

HeightForm.displayName = 'HeightForm'