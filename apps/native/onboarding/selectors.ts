import type { OnboardingData } from '~/hooks/useOnboardingData'

export function selectDisplayName(data: OnboardingData) {
  return data.user?.displayName || data.user?.fullName || ''
}

