import { FeaturedCarousel } from './featured-carousel'
import { FavoritesCarousel } from './favorites-carousel'
import { fetchQuery } from 'convex/nextjs'
import { api } from '@packages/backend/convex/_generated/api'

export default async function DiscoverPage() {
  const choreographers = await fetchQuery(api.featuredMembers.getFeaturedChoreographers)
  const talent = await fetchQuery(api.featuredMembers.getFeaturedTalent)
  return (
    <div className="flex flex-col gap-8">
      <FeaturedCarousel title="Partnering Choreographers" profiles={choreographers} />
      <FeaturedCarousel title="Featured Talent" profiles={talent} />
      <FavoritesCarousel />
    </div>
  )
}
