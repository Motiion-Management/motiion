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
import FlipArrowWhite from '@/public/profile-flip-arrow-white.svg'
import { Button } from '@/components/ui/button'
export function BigHeadshotCarousel({
  user,
  flip
}: {
  user: UserDoc
  flip: () => void
}) {
  const headshots = useQuery(api.resumes.getMyHeadshots)
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

  return (
    <div className={'relative grid'}>
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
        <div className="text-h3 pt-4">
          {user.firstName} {user.lastName}
        </div>
        <div className="text-h5">{user.location?.city}</div>
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
                    className="h-full w-full rounded-xl object-cover"
                    alt={headshot.title || 'Headshot'}
                  />
                </AspectRatio>
              </CarouselItem>
            ))
          ) : (
            <div>No headshots available</div> // Fallback UI when there are no headshots
          )}
        </CarouselContent>

        <Button
          size="icon"
          onClick={flip}
          className="absolute bottom-9 right-5 z-[1000]"
        >
          <Image src={FlipArrowWhite} alt="" />
        </Button>

        <CarouselPrevious className="carousel-button-override absolute left-1 h-full  w-1/3 opacity-0" />

        <CarouselNext className="carousel-button-override absolute right-1 h-full w-1/3 opacity-0" />
      </Carousel>
    </div>
  )
}
