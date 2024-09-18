import { FC } from 'react'
import {
  Carousel,
  CarouselItem,
  CarouselContent
} from '@/components/ui/carousel'
import { Separator } from '@/components/ui/separator'
import { DiscoverProfileCard, Profile } from './profile-card'

export const FeaturedCarousel: FC<{
  title: string
  profiles?: Profile[] | null
}> = ({ title, profiles }) => {

  if (!profiles) return null
  return (
    <div className="grid gap-4">
      <h2 className="text-h5">{title}</h2>
      <Carousel opts={{ dragFree: true }} className="overflow-scroll">
        <CarouselContent className="flex gap-4">
          {profiles.map((profile, index) => (
            <CarouselItem
              key={profile.headshotUrl + index}
              className="basis-1/2"
            >
              <DiscoverProfileCard {...profile} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <Separator />
    </div>
  )
}
