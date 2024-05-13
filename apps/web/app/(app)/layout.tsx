import { Toaster } from 'sonner'

export default async function AppLayout({
  children
}: {
  children: React.ReactNode
  redirector: React.ReactNode
}) {
  return (
    <>
      <div className="touch:bg-card grid h-dvh w-screen place-items-center bg-white/50">
        <div className="shadow-card bg-card grid h-full max-h-dvh min-h-max w-full grid-cols-1 grid-rows-[min-content_1fr] gap-4 overflow-clip overflow-y-auto p-4 shadow-md md:max-h-[850px] md:max-w-screen-sm md:rounded-2xl">
          {children}
        </div>
      </div>
      <Toaster />
    </>
  )
}
