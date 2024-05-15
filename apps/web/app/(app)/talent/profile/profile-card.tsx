'use client'
import { useState, useEffect } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import Image from 'next/image'
import { Progress } from '@/components/ui/progress'
import {
  CarouselApi,
  Carousel,
  CarouselItem,
  CarouselContent
} from '@/components/ui/carousel'
import { UserDoc } from '@packages/backend/convex/users'
import { AspectRatio } from '@/components/ui/aspect-ratio'

export function ProfileCard({ user }: { user: UserDoc }) {
  const [carousel, setCarousel] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    if (!carousel) {
      return
    }

    setCurrent(carousel.selectedScrollSnap())

    carousel.on('select', () => {
      setCurrent(carousel.selectedScrollSnap())
    })
  }, [carousel])
  const headshots = useQuery(api.resumes.getMyHeadshots)
  return (
    <div className="relative grid">
        <div className="flex gap-5 pt-3 justify-center">
          {headshots && headshots.length > 0
            ? headshots.map((headshot, index) => (
                <Progress
                  className={
                    current === index ? 'bg-accent z-10 w-16 h-2' : 'bg-background z-10 w-16 h-2'
                  
                  }
                  key={index}
                />
              ))
            : null}
        </div>
      <div className="text-primary-foreground absolute left-4 top-4 z-10 flex flex-col">
        <div className="text-xl pt-4">
          {user.firstName} {user.lastName}
        </div>
        <div className="text-lg">{user.location?.city}</div>
      </div>

      <Carousel setApi={setCarousel} className="absolute left-0 top-0 w-full">
        <CarouselContent>
          {headshots && headshots.length > 0 ? (
            headshots.map((headshot, index) => (
              <CarouselItem
                //onSelect={() => setCurrent(index)}
                key={index}
                className="w-full basis-auto"
              >
                <AspectRatio
                  key={index}
                  ratio={24 / 41}
                  className="w-full"
                  id="ar"
                >
                  <Image
                    key={headshot.title || headshot.url}
                    src={headshot.url || ''}
                    width={400}
                    height={600}
                    className="h-full w-full rounded-lg object-cover"
                    alt={headshot.title || 'Headshot'}
                  />
                </AspectRatio>
              </CarouselItem>
            ))
          ) : (
            <div>No headshots available</div> // Fallback UI when there are no headshots
          )}
        </CarouselContent>
      </Carousel>
    </div>
  )
}
