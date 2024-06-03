'use client'
import { Header } from '@/components/ui/header'
import { ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function FallbackTitleSlot() {
  const router = useRouter()
  return (
    <Header noSeparator>
      <button
        onClick={() => router.back()}
        className="flex w-full justify-start"
      >
        <ChevronLeft />
      </button>
    </Header>
  )
}
