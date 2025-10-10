import { useCallback, useEffect, useState } from 'react'

/**
 * Tracks the first resolved onboarding status so redirect guards can
 * distinguish initial hydration from subsequent state transitions.
 */
export function useInitialOnboardingStatus(status: boolean | null) {
  const [initialStatus, setInitialStatus] = useState<boolean | null>(null)
  const [lastStatus, setLastStatus] = useState<boolean | null>(null)
  const [statusChanged, setStatusChanged] = useState(false)

  useEffect(() => {
    if (status === null) return

    if (initialStatus === null) {
      setInitialStatus(status)
      setLastStatus(status)
      return
    }

    if (lastStatus !== status) {
      setLastStatus(status)
      setStatusChanged(true)
    }
  }, [status, initialStatus, lastStatus])

  const acknowledgeStatusChange = useCallback(() => {
    if (status === null) return

    setInitialStatus(status)
    setStatusChanged(false)
  }, [status])

  return {
    initialStatus,
    statusChanged,
    acknowledgeStatusChange,
    hasResolved: initialStatus !== null,
  }
}
