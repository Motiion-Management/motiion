import { useMemo } from 'react'
import { useUser } from '~/hooks/useUser'

export interface OnboardingData {
  user: ReturnType<typeof useUser>['user']
}

export function useOnboardingData() {
  const { user, isLoading } = useUser()

  // Shape reserved for future expansion (e.g., cached onboarding state)
  const data: OnboardingData = useMemo(() => ({ user }), [user])

  return { data, isLoading }
}

