import { Toaster } from 'sonner'

export default async function AppLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <div className="touch:bg-card bg-primary/10 grid h-dvh w-screen place-items-center">
        <div className="shadow-card bg-card h-full max-h-dvh min-h-max w-full overflow-clip overflow-y-auto shadow-md md:max-h-[850px] md:max-w-screen-sm md:rounded-2xl">
          {children}
        </div>
      </div>
      <Toaster />
    </>
  )
}
