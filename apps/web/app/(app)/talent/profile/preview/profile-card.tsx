'use client'
import { useState, useEffect } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import Image from 'next/image'
import { Progress } from '@/components/ui/progress'
import ReactCardFlip from 'react-card-flip'
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
  const [isFlipped, setIsFlipped] = useState(false)

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
    <ReactCardFlip isFlipped={isFlipped} flipDirection="horizontal" className="h-full">
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
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="bg-primary text-primary-foreground absolute bottom-5 right-4 z-[1000] rounded-full p-5"
          >
            <Image src={backArrow} />
          </button>

          <CarouselPrevious className="carousel-button-override absolute left-1 h-full  w-1/3 opacity-0" />

          <CarouselNext className="carousel-button-override absolute right-1 h-full w-1/3 opacity-0" />
        </Carousel>
      </div>
      <div className="relative grid stats-card">
        <div className="text-primary-foreground absolute left-4 top-4 z-10 flex flex-col">
          <div className="pt-4 text-xl">
            {user.firstName} {user.lastName}
          </div>
          <div className="text-lg">{user.location?.city}</div>
        </div>
      
        <div className="grid grid-cols-5 grid-rows-2 gap-4 mt-28 text-primary-foreground  p-5">
          <div className="flex flex-col">
            <p>27</p>
            <p>Age</p>
          </div>
          <div>
            <p>5+</p>
            <p>Yrs Exp</p>
          </div>
          <div>
            <p>F</p>
            <p>Gender</p>
          </div>
          <div>
            <p>5'6"</p>
            <p>Height</p>
          </div>
          <div>
            <p>Bl</p>
            <p>Hair Color</p>
          </div>
          <div>
            <p>Brw</p>
            <p>Eyes</p>
          </div>
          <div>
            <p>25"</p>
            <p>Chest</p>
          </div>
          <div>
            <p>30"</p>
            <p>Waist</p>
          </div>
          <div>
            <p>6.5</p>
            <p>Shoes</p>
          </div>
          <div>
            <p>38R</p>
            <p>Jacket</p>
          </div>
        </div>
      <div>
        <p>Representation</p>
        <p>Agency</p>
      </div>
      <div className="flex flex-col gap-5 items-center">
        <button className="bg-input rounded-full w-3/4 p-2">Contact</button>
        <button className="bg-input rounded-full w-3/4 p-2">Share Profile</button>
      </div>
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="bg-input text-primary-foreground absolute bottom-1 right-4 z-[1000] rounded-full p-5"
        >
          <Image alt="" src={backArrow} />
        </button>
      </div>
    </ReactCardFlip>
  )
}
