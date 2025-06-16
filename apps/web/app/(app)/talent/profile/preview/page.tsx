import { ProfileCard } from '@/components/features/profile/profile-card'
import { meX } from '@/lib/server/users'

import { ScrollCollapse } from '@/components/features/profile/scroll-collapse'
import { TabSection } from '@/components/features/profile/tab-section'

export default async function ProfilePage() {
  const user = await meX()
  return (
    <div className="flex flex-col gap-2">
      <ScrollCollapse collapsedTitle={`${user.fullName}`}>
        <ProfileCard user={user} />
      </ScrollCollapse>
      <TabSection user={user} />
    </div>
  )
}
