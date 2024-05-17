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
import { UserStats } from './user-stats'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

async function shareLink(shareTitle: string, shareText: string, link: string) {
  const shareData = {
    title: shareTitle,
    text: shareText,
    url: link
  }
  try {
    if (navigator?.share && navigator.canShare(shareData)) {
      await navigator.share(shareData)
    } else {
      throw new Error('Web Share API not supported')
    }
  } catch (e: any) {
    toast.error(e.message || 'Failed to share link')
    console.error(e)
  }
}

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
  return (
    <ReactCardFlip
      cardStyles={{
        front: { zIndex: 'unset', transformStyle: 'initial' },
        back: { zIndex: 'unset', transformStyle: 'initial' }
      }}
      isFlipped={isFlipped}
      flipDirection="horizontal"
    >
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

          <UserStats userStats={userStats} />
          <div className="flex flex-col items-center gap-5 px-6 pt-20">
            <a href={`mailto:${user.email}`} className="w-full">
              <Button variant="inverted" className="w-full">
                <Image alt="Email Icon" src={EmailIcon} />
                Contact
              </Button>
            </a>
            <Button
              variant="inverted"
              className="w-full"
              onClick={async () =>
                await shareLink(
                  `Motiion - ${user.firstName} ${user.lastName}`,
                  'Check out my profile on Motiion, the network for dancers.',
                  window.location.href
                )
              }
            >
              <Image alt="Email Icon" src={ForwardingIcon} />
              Share Profile
            </Button>
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
