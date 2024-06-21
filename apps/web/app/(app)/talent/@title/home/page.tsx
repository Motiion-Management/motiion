import { Header } from '@/components/ui/header'
import { me } from '@/lib/server/users'

export default async function TitleSlot() {
  const user = await me()
  return (
    <Header title={`Hi, ${user.displayName || user.firstName}`} noSeparator />
  )
}
