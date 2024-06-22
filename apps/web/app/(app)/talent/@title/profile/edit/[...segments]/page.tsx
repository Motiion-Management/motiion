import { Header } from '@/components/ui/header'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { EditHeaderBody } from './edit-header-body'
import { meX } from '@/lib/server/users'

export default async function EditPageHeader() {
  const user = await meX()

  return (
    <Header
      actionSlot={
        <Link href={'/talent/profile'}>
          <ChevronLeft size={24} />
        </Link>
      }
    >
      <EditHeaderBody user={user} />
    </Header>
  )
}
