import { ProfileCard } from '@/components/features/profile/profile-card'
import { me } from '@/lib/server/users'

import { ScrollCollapse } from '@/components/features/profile/scroll-collapse'
import { TabSection } from '@/components/features/profile/tab-section'
import { getMyResume } from '@/lib/server/resumes'

export default async function ProfilePage() {
  const user = await me()
  const resume = await getMyResume()
  return (
    <div className="flex flex-col gap-2 ">
      <ScrollCollapse collapsedTitle={`${user.firstName} ${user.lastName}`}>
        <ProfileCard user={user} resume={resume} />
      </ScrollCollapse>
      <TabSection user={user} resume={resume} />
    </div>
  )
}
