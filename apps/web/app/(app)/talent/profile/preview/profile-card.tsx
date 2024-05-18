'use client'
import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import Image from 'next/image'
import ReactCardFlip from 'react-card-flip'
import { UserDoc } from '@packages/backend/convex/users'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import './profile-card.css'
import FlipArrowBlack from '@/public/profile-flip-arrow-black.svg'
import ForwardingIcon from '@/public/profile-forwarding-icon.svg'
import EmailIcon from '@/public/profile-email-icon.svg'
import { UserStats } from './user-stats'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { BigHeadshotCarousel } from './big-headshot-carousel'

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
  const userStats = useQuery(api.resumes.getMyStats)
  const [isFlipped, setIsFlipped] = useState(false)

  function flip() {
    setIsFlipped(!isFlipped)
  }
  return (
    <AspectRatio ratio={24 / 41} className="w-full" id="ar">
      <ReactCardFlip
        cardStyles={{
          front: { zIndex: 'unset', transformStyle: 'initial' },
          back: { zIndex: 'unset', transformStyle: 'initial' }
        }}
        isFlipped={isFlipped}
        flipDirection="horizontal"
      >
        <BigHeadshotCarousel flip={flip} user={user} />
        <div className="stats-card relative grid h-full w-full grid-cols-1 grid-rows-[min-content_min-content_1fr_min-content] gap-4 overflow-hidden rounded-xl py-4">
          {/* min-content */}
          <div className="text-primary-foreground left-4 top-4 z-10 flex flex-col px-5">
            <div className="text-h3 pt-4">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-h5">{user.location?.city}</div>
          </div>

          {/* min-content */}
          <UserStats userStats={userStats} />

          {/* 1fr */}
          <div className="z-10 flex flex-col items-center justify-end gap-5 px-6">
            <a href={`mailto:${user.email}`} className="w-full">
              <Button variant="inverted" className="flex w-full gap-1">
                <Image alt="Email Icon" src={EmailIcon} />
                Contact
              </Button>
            </a>
            <Button
              variant="inverted"
              className="flex w-full gap-1"
              onClick={async () =>
                await shareLink(
                  `Motiion - ${user.firstName} ${user.lastName}`,
                  'Check out my profile on Motiion, the network for dancers.',
                  '/talent/profile/preview' //TODO: replace with user profile link when page is done
                )
              }
            >
              <Image alt="Email Icon" src={ForwardingIcon} />
              Share Profile
            </Button>
          </div>

          {/* min-content */}
          <div className="z-50 flex items-end justify-end p-5">
            <Button variant="inverted" size="icon" onClick={flip}>
              <Image alt="" src={FlipArrowBlack} />
            </Button>
          </div>
        </div>
      </ReactCardFlip>
    </AspectRatio>
  )
}
