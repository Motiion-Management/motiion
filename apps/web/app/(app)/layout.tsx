import { OnboardingCheck } from './onboarding-check'

export default async function AppLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <OnboardingCheck />
      {children}
    </>
  )
}
