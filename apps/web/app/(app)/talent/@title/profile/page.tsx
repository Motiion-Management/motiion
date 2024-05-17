import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/ui/header'
import { Eye } from 'lucide-react'
import Link from 'next/link'

export default function TitleSlot() {
  return (
    <Header
      title="Profile"
      actionSlot={
        <Link href="/talent/profile/preview">
          <Badge variant="outline" className="flex gap-2">
            Edit <Eye className="stroke-gray-500" />
          </Badge>
        </Link>
      }
    />
  )
}
