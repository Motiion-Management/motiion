import { Toaster } from '@/components/ui/toaster'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-w-screen grid min-h-screen place-items-center">
      <div className="bg-card shadow-card max-h-full max-w-screen-sm overflow-clip shadow-md md:rounded-2xl">
        {children}
        <Toaster />
      </div>
    </div>
  )
}
