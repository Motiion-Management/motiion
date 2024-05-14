'use client'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/ui/header'
import { Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function TitleSlot() {
  const router = useRouter()
  const goToEdit = () => router.push('/talent/profile/edit')
  return (
    <Header
      title="Profile"
      actionSlot={
        <Badge className="flex gap-2" onClick={goToEdit}>
          Preview <Eye />
        </Badge>
      }
    />
  )
}
