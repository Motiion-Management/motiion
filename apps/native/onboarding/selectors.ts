import type { OnboardingData } from '~/hooks/useOnboardingData'

export function selectDisplayName(data: OnboardingData) {
  return data.user?.displayName || data.user?.fullName || ''
}

export function selectHeight(data: OnboardingData) {
  return data.user?.attributes?.height || { feet: 5, inches: 6 }
}

export function selectEthnicity(data: OnboardingData) {
  return data.user?.attributes?.ethnicity || []
}

export function selectHairColor(data: OnboardingData) {
  return data.user?.attributes?.hairColor || undefined
}

export function selectEyeColor(data: OnboardingData) {
  return data.user?.attributes?.eyeColor || undefined
}

export function selectGender(data: OnboardingData) {
  return data.user?.attributes?.gender || undefined
}
