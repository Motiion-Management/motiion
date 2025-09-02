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

export function selectPrimaryPlaceKitLocation(data: OnboardingData) {
  return data.user?.location
    ? {
        city: data.user.location.city || '',
        state: data.user.location.state || '',
        stateCode: data.user.location.state || '',
        country: data.user.location.country || 'United States',
      }
    : null
}

export function selectWorkLocations(data: OnboardingData) {
  return (
    data.user?.workLocation?.map((s) => {
      const [city, state] = s.split(', ')
      return { city, state, stateCode: state, country: 'United States' }
    }) || []
  )
}

export function selectSkills(data: OnboardingData) {
  return {
    skills: data.user?.resume?.skills || [],
    genres: data.user?.resume?.genres || [],
  }
}

export function selectRepresentationStatus(data: OnboardingData) {
  return { representationStatus: (data.user?.representationStatus as any) || undefined }
}

export function selectAgencyId(data: OnboardingData) {
  return { agencyId: data.user?.representation?.agencyId || '' }
}
