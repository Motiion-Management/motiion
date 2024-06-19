import { OtherLinksForm } from './other-links-form'
import { preloadMe } from '@/lib/server/users'

export default async function ProfileEditReelPage() {
  const [preloadedUser] = await preloadMe()

  return <OtherLinksForm preloadedUser={preloadedUser} />
}
