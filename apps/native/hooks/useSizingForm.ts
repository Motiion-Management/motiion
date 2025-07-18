import { api } from '@packages/backend/convex/_generated/api'
import { useMutation, useQuery } from 'convex/react'
import { useState, useCallback, useEffect } from 'react'

import { SizingData, SizingSection } from '~/types/sizing'

export function useSizingForm() {
  const user = useQuery(api.users.getMyUser)
  const updateUser = useMutation(api.users.updateMyUser)

  const [sizingData, setSizingData] = useState<SizingData>({
    general: {},
    male: {},
    female: {},
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load existing sizing data from user profile
  useEffect(() => {
    if (user?.sizing) {
      setSizingData({
        general: user.sizing.general || {},
        male: user.sizing.male || {},
        female: user.sizing.female || {},
      })
    }
  }, [user?.sizing])

  const updateMetric = useCallback(
    async (section: SizingSection, field: string, value: string | undefined) => {
      setError(null)
      setIsSubmitting(true)

      try {
        const updatedData = {
          ...sizingData,
          [section]: {
            ...sizingData[section],
            [field]: value,
          },
        }

        // Update local state immediately for responsiveness
        setSizingData(updatedData)

        // Update in the backend
        await updateUser({
          sizing: updatedData,
        })

        return true
      } catch (err) {
        console.error('Error updating sizing:', err)
        setError('Failed to save sizing data. Please try again.')
        
        // Revert local state on error
        if (user?.sizing) {
          setSizingData({
            general: user.sizing.general || {},
            male: user.sizing.male || {},
            female: user.sizing.female || {},
          })
        }
        
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [sizingData, updateUser, user?.sizing]
  )

  const getMetricValue = useCallback(
    (section: SizingSection, field: string): string | undefined => {
      return sizingData[section]?.[field as keyof typeof sizingData[typeof section]]
    },
    [sizingData]
  )

  const clearMetric = useCallback(
    async (section: SizingSection, field: string) => {
      return updateMetric(section, field, undefined)
    },
    [updateMetric]
  )

  return {
    models: {
      sizingData,
      isSubmitting,
      error,
      isLoading: user === undefined,
    },
    actions: {
      updateMetric,
      getMetricValue,
      clearMetric,
      clearError: () => setError(null),
    },
  }
}