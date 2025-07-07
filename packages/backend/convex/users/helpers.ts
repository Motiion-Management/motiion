import { ONBOARDING_STEPS } from '../validators/users'

export const NEW_USER_DEFAULTS = {
  type: 'member',
  isAdmin: false,
  pointsEarned: 0,
  onboardingStep: ONBOARDING_STEPS.PROFILE_TYPE
} as const

export function formatFullName(firstName?: string, lastName?: string) {
  return `${firstName || ''} ${lastName || ''}`.trim()
}

export function onlyUnique(value: any, index: number, array: any[]) {
  return array.indexOf(value) === index
}
