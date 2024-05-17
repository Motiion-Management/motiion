import { ProfileCard } from './profile-card'
import { me } from '@/lib/server/users'

export default async function ProfilePage() {
  const user = await me()
  return (
    <div className="flex w-full flex-col gap-2">
      <ProfileCard user={user} />
    </div>
  )
}
