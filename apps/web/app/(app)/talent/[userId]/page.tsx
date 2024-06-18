import { Id } from '@packages/backend/convex/_generated/dataModel'
import { ScrollCollapse } from '@/components/features/profile/scroll-collapse'
import { ProfileCard } from '@/components/features/profile/profile-card'
import { TabSection } from '@/components/features/profile/tab-section'
import { fetchPublicUser } from '@/lib/server/users'

export default async function UserProfilePage({
  params
}: {
  params: { userId: Id<'users'> }
}) {
  const user = await fetchPublicUser(params.userId)
  return (
    <div className="flex flex-col gap-2 ">
      <ScrollCollapse collapsedTitle={`${user?.firstName} ${user?.lastName}`}>
        <ProfileCard user={user} />
      </ScrollCollapse>
      <TabSection user={user} />
    </div>
  )
}
