import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/ui/header'
import { Eye } from 'lucide-react'

export default function TitleSlot() {
  return (
    <Header
      title="Profile"
      actionSlot={
        <Badge className="flex gap-2">
          Preview <Eye />
        </Badge>
      }
    />
  )
}
