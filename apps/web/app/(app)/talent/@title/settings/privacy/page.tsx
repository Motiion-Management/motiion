import { Header } from '@/components/ui/header'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default async function EditPageHeader() {
  return (
    <Header
      actionSlot={
        <Link href={'/talent/settings'}>
          <ChevronLeft size={24} />
        </Link>
      }
    >
      <div className="flex w-full flex-col gap-2">
        <h1 className="text-primary text-h3 flex-1 capitalize">
          Data and Privacy
        </h1>
        <span className="text-label-xs uppercase">settings</span>
      </div>
    </Header>
  )
}
