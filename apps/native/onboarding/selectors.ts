import type { OnboardingData } from '~/hooks/useOnboardingData';
import type { DancerDoc } from '@packages/backend/convex/schemas/dancers';

// Type guard to check if profile is a DancerDoc
function isDancerProfile(profile: OnboardingData['profile']): profile is DancerDoc {
  return profile !== null && 'attributes' in profile;
}

export function selectDisplayName(data: OnboardingData) {
  return data.profile?.displayName || data.user?.fullName || '';
}

export function selectHeight(data: OnboardingData) {
  // Attributes are dancer-specific
  const profileAttrs = isDancerProfile(data.profile) ? data.profile.attributes : undefined;
  return profileAttrs?.height || { feet: 5, inches: 6 };
}

export function selectEthnicity(data: OnboardingData) {
  const profileAttrs = isDancerProfile(data.profile) ? data.profile.attributes : undefined;
  return profileAttrs?.ethnicity || [];
}

export function selectHairColor(data: OnboardingData) {
  const profileAttrs = isDancerProfile(data.profile) ? data.profile.attributes : undefined;
  return profileAttrs?.hairColor || undefined;
}

export function selectEyeColor(data: OnboardingData) {
  const profileAttrs = isDancerProfile(data.profile) ? data.profile.attributes : undefined;
  return profileAttrs?.eyeColor || undefined;
}

export function selectGender(data: OnboardingData) {
  const profileAttrs = isDancerProfile(data.profile) ? data.profile.attributes : undefined;
  return profileAttrs?.gender || undefined;
}

export function selectProfileType(data: OnboardingData) {
  return { profileType: (data.user?.activeProfileType as any) || undefined } as any;
}

export function selectPrimaryPlaceKitLocation(data: OnboardingData) {
  const location = data.profile?.location;
  return location
    ? {
        city: location.city || '',
        state: location.state || '',
        stateCode: location.state || '',
        country: location.country || 'United States',
      }
    : null;
}

export function selectWorkLocations(data: OnboardingData) {
  // workLocation is dancer-specific
  const workLocation = isDancerProfile(data.profile) ? data.profile.workLocation : undefined;
  return (
    workLocation?.map((s: string) => {
      const [city, state] = s.split(', ');
      return { city, state, stateCode: state, country: 'United States' };
    }) || []
  );
}

export function selectSkills(data: OnboardingData) {
  return {
    skills: data.profile?.skills || [],
    genres: data.profile?.genres || [],
  };
}

export function selectRepresentationStatus(data: OnboardingData) {
  return {
    representationStatus: (data.profile?.representationStatus as any) || undefined,
  };
}

export function selectAgencyId(data: OnboardingData) {
  return {
    agencyId: data.profile?.representation?.agencyId || '',
  };
}

export function selectSagAftraId(data: OnboardingData) {
  // SAG-AFTRA is dancer-specific
  const profileSagAftraId = isDancerProfile(data.profile) ? data.profile.sagAftraId : undefined;
  return { sagAftraId: profileSagAftraId || '' };
}
