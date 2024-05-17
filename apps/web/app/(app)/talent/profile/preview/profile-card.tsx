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
    setIsFlipped((prev) => !prev)
  }
  return (
    <ReactCardFlip
      cardStyles={{
        front: { zIndex: 'unset', transformStyle: 'initial' },
        back: { zIndex: 'unset', transformStyle: 'initial' }
      }}
      isFlipped={isFlipped}
      flipDirection="horizontal"
    >
      <BigHeadshotCarousel flip={flip} user={user} />
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
            onClick={flip}
            className="bg-input text-primary-foreground absolute bottom-5 right-4 z-[1000] rounded-full p-5"
          >
            <Image alt="" src={FlipArrowBlack} />
          </button>
        </AspectRatio>
      </div>
    </ReactCardFlip>
  )
}
