import { OnboardingCheck } from './onboarding-check'

export default async function RedirectCheckerDefault(props: {
  params: { segments: string[] }
}) {
  return <OnboardingCheck />
}
