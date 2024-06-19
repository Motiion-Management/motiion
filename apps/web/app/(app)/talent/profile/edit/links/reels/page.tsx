import { ReelForm } from './reel-form'
import { preloadMe } from '@/lib/server/users'

export default async function ProfileEditReelPage() {
  const [preloadedUser] = await preloadMe()

  return <ReelForm preloadedUser={preloadedUser} />
}
