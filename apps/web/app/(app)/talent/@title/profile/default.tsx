import { Header } from '@/components/ui/header'
import { Circle } from 'lucide-react'

export default function TitleSlot() {
  return (
    <Header title="Title" actionSlot={<Circle />}>
      -------test-------
    </Header>
  )
}
