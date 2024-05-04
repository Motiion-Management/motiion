import './onboarding.css'
import { Toaster } from '@/components/ui/toaster'
import { ProgressHeader } from './progress-header'

export default function OnboardingLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-w-screen grid min-h-screen place-items-center">
      <div className="bg-card shadow-card max-h-full max-w-screen-sm overflow-clip p-4 shadow-md md:rounded-2xl">
        <ProgressHeader />
        {children}
        <Toaster />
      </div>
    </div>
  )
}
