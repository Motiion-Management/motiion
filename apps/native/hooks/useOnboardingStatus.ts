import { useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useQuery } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'

const ONBOARDING_COMPLETE_KEY = 'onboarding_complete'

export function useOnboardingStatus() {
  const [localComplete, setLocalComplete] = useState<boolean | null>(null)

  // Fetch from Convex in background for sync
  const serverStatus = useQuery(api.onboarding.getOnboardingRedirect)

  // Load from AsyncStorage on mount
  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY).then((value) => {
      setLocalComplete(value === 'true')
    })
  }, [])

  // Sync with server data when it arrives (background sync)
  useEffect(() => {
    if (serverStatus !== undefined && localComplete !== null) {
      const serverComplete = !serverStatus.shouldRedirect

      // If server says complete but local doesn't, update local
      if (serverComplete && !localComplete) {
        AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true')
        setLocalComplete(true)
      }
      // If server says incomplete but local does, trust server (user reset onboarding)
      else if (!serverComplete && localComplete) {
        AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'false')
        setLocalComplete(false)
      }
    }
  }, [serverStatus, localComplete])

  const markComplete = useCallback(async () => {
    await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true')
    setLocalComplete(true)
  }, [])

  const markIncomplete = useCallback(async () => {
    await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'false')
    setLocalComplete(false)
  }, [])

  return {
    onboardingComplete: localComplete,
    isLoading: localComplete === null,
    redirectPath: serverStatus?.redirectPath || '/app/onboarding/profile/display-name',
    markComplete,
    markIncomplete,
  }
}
