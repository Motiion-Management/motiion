import { FeaturedCarousel } from './featured-carousel'
import { fetchQuery } from 'convex/nextjs'
import { getAuthToken } from '@/lib/server/utils'
import { api } from '@packages/backend/convex/_generated/api'
import { UsersGrid } from './users-grid'

export default async function DiscoverPage() {
  const choreographers = await fetchQuery(
    api.featuredMembers.getFeaturedChoreographers
  )
  const talent = await fetchQuery(api.featuredMembers.getFeaturedTalent)
  const token = await getAuthToken()
  const favorites = await fetchQuery(
    api.users.getFavoriteUsersForCarousel,
    {},
    { token }
  )

  return (
    <div className="flex flex-col gap-8">
      <FeaturedCarousel
        title="Partnering Choreographers"
        profiles={choreographers}
      />
      <FeaturedCarousel title="Featured Talent" profiles={talent} />
      <FeaturedCarousel title="Favorite Profiles" profiles={favorites} />
      <UsersGrid />
    </div>
  )
}
