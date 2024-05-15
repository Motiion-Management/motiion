'use client'
import { Header } from '@/components/ui/header'
import { usePathname } from 'next/navigation'

export default function TitleSlot() {
  const pathname = usePathname().replace(/\/talent\//, '')
  return (
    <Header title="Motiion">
      {process.env.NEXT_PUBLIC_ENV === 'development' && (
        <span>
          This is the default header. To use a custom header, create a component
          at
          <code className="bg-muted ml-1 inline px-1 text-sm">{`/app/(app)/talent/@title/${pathname}/page.tsx`}</code>
          <br />
          <span className="text-destructive text-sm">
            This message will only show in development.
          </span>
        </span>
      )}
    </Header>
  )
}
