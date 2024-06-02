import { ProfileCard } from './profile-card'
import { me } from '@/lib/server/users'

import { PreviewTabs } from './preview-tabs'
import { ScrollCollapse } from './scroll-collapse'
export default async function ProfilePage() {
  const user = await me()
  return (
    <div className="flex flex-col gap-2 ">
      <ScrollCollapse collapsedTitle={`${user.firstName} ${user.lastName}`}>
        <ProfileCard user={user} />
      </ScrollCollapse>
      <PreviewTabs snapTarget="preview" />
    </div>
  )
}
