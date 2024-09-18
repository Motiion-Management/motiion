export default async function AppLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="touch:bg-background bg-primary/10 grid h-dvh w-screen place-items-center">
      <div className="shadow-card bg-background h-full max-h-dvh min-h-max w-full overflow-clip overflow-y-auto py-5 shadow-md md:max-h-[850px] md:max-w-md md:rounded-2xl">
        {children}
      </div>
    </div>
  )
}
