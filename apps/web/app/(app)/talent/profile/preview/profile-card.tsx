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
  CarouselContent,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel'
import { UserDoc } from '@packages/backend/convex/users'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import './profile-card.css'
import backArrow from '@/public/profile-back-arrow.svg'
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
      <div className="flex justify-center gap-5 pt-3">
        {headshots && headshots.length > 0
          ? headshots.map((headshot, index) => (
              <Progress
                className={
                  current === index
                    ? 'bg-accent z-10 h-2 w-16'
                    : 'bg-background z-10 h-2 w-16'
                }
                key={index}
              />
            ))
          : null}
      </div>
      <div className="text-primary-foreground absolute left-4 top-4 z-10 flex flex-col">
        <div className="pt-4 text-xl">
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
        <button className="bg-primary text-primary-foreground rounded-full p-5 absolute bottom-5 right-4"><Image src={backArrow}/></button>

        <CarouselPrevious className="carousel-button-override absolute h-full left-1  w-1/3 opacity-0" />

        <CarouselNext className="carousel-button-override absolute h-full right-1 w-1/3 opacity-0" />
      </Carousel>
    </div>
  )
}
