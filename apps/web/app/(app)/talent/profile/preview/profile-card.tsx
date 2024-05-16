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
import FlipArrowWhite from '@/public/profile-flip-arrow-white.svg'
import FlipArrowBlack from '@/public/profile-flip-arrow-black.svg'
import ForwardingIcon from '@/public/profile-forwarding-icon.svg'
import EmailIcon from '@/public/profile-email-icon.svg'
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
  const userStats = useQuery(api.resumes.getMyStats)
  let chest,
    eyeColor,
    hairColor,
    height,
    jacket,
    shoes,
    waist,
    yearsOfExperience,
    representation
  if (userStats && typeof userStats === 'object' && !Array.isArray(userStats)) {
    ;({
      chest,
      eyeColor,
      hairColor,
      height,
      jacket,
      shoes,
      waist,
      yearsOfExperience,
      representation
    } = userStats)
  }
  let age
  if (user.dateOfBirth) {
    const birthDate = new Date(user.dateOfBirth)
    const today = new Date()
    age = today.getFullYear() - birthDate.getFullYear()
    const month = today.getMonth() - birthDate.getMonth()
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
  }
  const gender = user?.gender?.charAt(0).toUpperCase()
  
  return (
    <ReactCardFlip
      isFlipped={isFlipped}
      flipDirection="horizontal"
      className="h-full"
    >
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
            <Image src={FlipArrowWhite} alt="" />
          </button>

          <CarouselPrevious className="carousel-button-override absolute left-1 h-full  w-1/3 opacity-0" />

          <CarouselNext className="carousel-button-override absolute right-1 h-full w-1/3 opacity-0" />
        </Carousel>
      </div>
      <div className="stats-card relative grid">
        <AspectRatio ratio={24 / 41} className="w-full" id="ar">
          <div className="text-primary-foreground absolute left-4 top-4 z-10 flex flex-col">
            <div className="pt-4 text-xl">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-lg">{user.location?.city}</div>
          </div>

          <div className="text-primary-foreground mt-28 grid grid-cols-5 grid-rows-2 gap-5 border-b border-t p-5">
            <div className="flex flex-col">
              <p>{age}</p>
              <p className="text-xs uppercase tracking-[0.6px]">Age</p>
            </div>
            <div>
              <p>{yearsOfExperience}</p>
              <p className="text-xs uppercase tracking-[0.6px]">Yrs Exp</p>
            </div>
            <div>
              <p>{gender}</p>
              <p className="text-xs uppercase tracking-[0.6px]">Gender</p>
            </div>
            <div>
              <p>{height}</p>
              <p className="text-xs uppercase tracking-[0.6px]">Height</p>
            </div>
            <div>
              <p className="capitalize">{hairColor?.slice(0, 2)}</p>
              <p className="text-xs uppercase tracking-[0.6px]">Hair</p>
            </div>
            <div>
              <p className="capitalize">{eyeColor?.slice(0, 3)}</p>
              <p className="text-xs uppercase tracking-[0.6px]">Eyes</p>
            </div>
            <div>
              <p>{chest}</p>
              <p className="text-xs uppercase tracking-[0.6px]">Chest</p>
            </div>
            <div>
              <p>{waist}</p>
              <p className="text-xs uppercase tracking-[0.6px]">Waist</p>
            </div>
            <div>
              <p>{shoes}</p>
              <p className="text-xs uppercase tracking-[0.6px]">Shoes</p>
            </div>
            <div>
              <p>{jacket}</p>
              <p className="text-xs uppercase tracking-[0.6px]">Jacket</p>
            </div>
          </div>
          <div className="text-primary-foreground flex justify-around gap-5 pt-6">
            <p>{representation}</p>
            <p>Agency</p>
          </div>
          <div className="flex flex-col items-center gap-5 pt-20">
            <button className="bg-input flex w-3/4 justify-center gap-1 rounded-full p-2">
              <Image alt="Email Icon" src={EmailIcon} />
              Contact
            </button>
            <button className="bg-input flex w-3/4 justify-center gap-1 rounded-full p-2">
              <Image alt="Email Icon" src={ForwardingIcon} />
              Share Profile
            </button>
          </div>
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="bg-input text-primary-foreground absolute bottom-5 right-4 z-[1000] rounded-full p-5"
          >
            <Image alt="" src={FlipArrowBlack} />
          </button>
        </AspectRatio>
      </div>
    </ReactCardFlip>
  )
}
