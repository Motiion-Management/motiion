import { OnboardingCheckClient } from './onboarding-check-client'
import { ProgressHeader } from './progress-header'

export default function OnboardingLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grid h-full w-full grid-cols-1 grid-rows-[min-content_1fr] gap-4 p-4 pb-8">
      <OnboardingCheckClient />
      <ProgressHeader />
      {children}
    </div>
  )
}
