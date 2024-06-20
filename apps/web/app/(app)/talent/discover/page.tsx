import { Separator } from '@/components/ui/separator'
import { FeaturedCarousel } from './featured-carousel'
import { FavoritesCarousel } from './favorites-carousel'

export default function DiscoverPage() {
  return (
    <div className="flex flex-col gap-8">
      <FeaturedCarousel title="Partnering Choreographers" profiles={[]} />
      <Separator />
      <FeaturedCarousel title="Featured Talent" profiles={[]} />
      <Separator />
      <FavoritesCarousel />
    </div>
  )
}
