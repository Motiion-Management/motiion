import { Id } from '@packages/backend/convex/_generated/dataModel'
import { ScrollCollapse } from '@/components/features/profile/scroll-collapse'
import { ProfileCard } from '@/components/features/profile/profile-card'
import { TabSection } from '@/components/features/profile/tab-section'
import { fetchPublicUser } from '@/lib/server/users'

type UserProfileRouteProps = {
  params: { userId: Id<'users'> }
}

export async function generateMetadata({ params }: UserProfileRouteProps) {
  const user = await fetchPublicUser(params.userId)
  const title = user.fullName || 'Dancer Profile'
  const description = `See my full dancer profile on Motiion, and join the dance community with the best connections in the world!`

  const pagePath = `/talent/${params.userId}`
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
      url: pagePath,
      images: [
        {
          url: pagePath + '/og'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [
        {
          url: pagePath + '/og'
        }
      ]
    }
  }
}

export default async function UserProfilePage({
  params
}: UserProfileRouteProps) {
  const user = await fetchPublicUser(params.userId)
  return (
    <div className="flex flex-col gap-2 ">
      <ScrollCollapse collapsedTitle={`${user.fullName}`}>
        <ProfileCard user={user} />
      </ScrollCollapse>
      <TabSection user={user} />
    </div>
  )
}
