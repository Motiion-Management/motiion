import { Id } from '@packages/backend/convex/_generated/dataModel'
import { ScrollCollapse } from '@/components/features/profile/scroll-collapse'
import { ProfileCard } from '@/components/features/profile/profile-card'
import { TabSection } from '@/components/features/profile/tab-section'
import { getPublicUser } from '@/lib/server/users'
import { getPublicResume } from '@/lib/server/resumes'

export default async function UserProfilePage({
  params
}: {
  params: { userId: Id<'users'> }
}) {
  const user = await getPublicUser(params.userId)
  const resume = await getPublicResume(params.userId)
  return (
    <div className="flex flex-col gap-2 ">
      <ScrollCollapse collapsedTitle={`${user?.firstName} ${user?.lastName}`}>
        <ProfileCard user={user} resume={resume} />
      </ScrollCollapse>
      <TabSection user={user} resume={resume} />
    </div>
  )
}
