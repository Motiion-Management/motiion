import { OnboardingCheckClient } from './onboarding-check-client'
import './onboarding.css'
import { ProgressHeader } from './progress-header'

export default function OnboardingLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <ProgressHeader />
      <OnboardingCheckClient />
      {children}
    </>
  )
}
