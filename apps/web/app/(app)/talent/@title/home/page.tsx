import { Button } from '@/components/ui/button'
import { Header } from '@/components/ui/header'
import { me } from '@/lib/server/users'
import Link from 'next/link'

export default async function TitleSlot() {
  const user = await me()
  return (
    <Header
      title={user ? `Hi, ${user.displayName || user.firstName}` : 'Motiion'}
      noSeparator
      actionSlot={
        !user && (
          <Link href="/sign-up">
            <Button size="sm">Sign up</Button>
          </Link>
        )
      }
    />
  )
}
