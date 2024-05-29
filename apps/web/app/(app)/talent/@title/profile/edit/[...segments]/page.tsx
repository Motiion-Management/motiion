import { Header } from '@/components/ui/header'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { EditHeaderBody } from './edit-header-body'
import { me } from '@/lib/server/users'

export default async function EditPageHeader() {
  const user = await me()

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
