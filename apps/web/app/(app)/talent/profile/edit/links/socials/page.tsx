import { SocialLinksForm } from './social-links-form'
import { preloadMe } from '@/lib/server/users'

export default async function ProfileEditReelPage() {
  const [preloadedUser] = await preloadMe()

  return <SocialLinksForm preloadedUser={preloadedUser} />
}
