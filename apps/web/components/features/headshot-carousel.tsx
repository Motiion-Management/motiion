import { StaticImageData } from 'next/image'
import { api } from '@packages/backend/convex/_generated/api'
import { Carousel, CarouselContent } from '@/components/ui/carousel'
import {
  HeadshotCount,
  HeadshotPlaceholder,
  HeadshotSkeleton,
  Headshots
} from './headshots'
import { preloadQuery } from 'convex/nextjs'

export async function HeadshotCarousel({
  title,
  onboarding,
  placeholderText,
  placeholderImage
}: {
  title: string
  onboarding?: boolean
  placeholderText?: string
  placeholderImage?: StaticImageData
}) {
  const preloadedHeadshots = await preloadQuery(
    api.users.headshots.getMyHeadshots
  )
  //wrap this in a grid to prevent overflow
  return (
    <div className="flex flex-col items-start">
      <div className="mb-3 flex w-full justify-between">
        <h4 className="text-h4 text-secondary dark:text-foreground">{title}</h4>
        <HeadshotCount preloadedHeadshots={preloadedHeadshots} />
      </div>

      <Carousel opts={{ dragFree: true }} className="w-full">
        <CarouselContent visible>
          <Headshots
            preloadedHeadshots={preloadedHeadshots}
            onboarding={onboarding}
          />
        </CarouselContent>
      </Carousel>
      <HeadshotPlaceholder
        preloadedHeadshots={preloadedHeadshots}
        placeholderText={placeholderText}
        placeholderImage={placeholderImage}
        placeholderSlot={
          onboarding ? undefined : (
            <div className="flex gap-2">
              <HeadshotSkeleton count={5} />
            </div>
          )
        }
      />
    </div>
  )
}
