import './onboarding.css'
import { Toaster } from 'sonner'
import { ProgressHeader } from './progress-header'

export default function OnboardingLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="touch:bg-card grid h-dvh w-screen place-items-center bg-white/50">
      <div className="shadow-card bg-card touch:h-full grid h-[90%] max-h-dvh min-h-max w-full max-w-md grid-cols-1 grid-rows-[min-content_1fr] gap-4 overflow-clip overflow-y-auto p-4 shadow-md md:rounded-2xl">
        <ProgressHeader />
        {children}
      </div>
      <Toaster />
    </div>
  )
}
