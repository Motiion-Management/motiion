'use client'
import { useState } from 'react'
import Image from 'next/image'
import ReactCardFlip from 'react-card-flip'
import { UserDoc } from '@packages/backend/convex/validators/users'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import './profile-card.css'
import FlipArrowBlack from '@/public/profile-flip-arrow-black.svg'
import ForwardingIcon from '@/public/profile-forwarding-icon.svg'
import EmailIcon from '@/public/profile-email-icon.svg'
import { UserStats } from './user-stats'
import { Button } from '@/components/ui/button'
import { BigHeadshotCarousel } from './big-headshot-carousel'
import { createShareLink } from '@/lib/utils'

export function ProfileCard({ user }: { user: UserDoc }) {
  const [isFlipped, setIsFlipped] = useState(false)

  function flip() {
    setIsFlipped(!isFlipped)
  }
  return (
    <AspectRatio
      ratio={24 / 40}
      className="h-full w-auto group-data-[open=true]:pointer-events-none"
      id="ar"
    >
      <ReactCardFlip
        cardStyles={{
          front: { zIndex: 'unset', transformStyle: 'initial' },
          back: { zIndex: 'unset', transformStyle: 'initial' }
        }}
        isFlipped={isFlipped}
        flipDirection="horizontal"
      >
        <AspectRatio
          ratio={24 / 40}
          className="h-full w-auto group-data-[open=true]:pointer-events-none"
        >
          <BigHeadshotCarousel flip={flip} user={user} />
        </AspectRatio>
        <AspectRatio
          ratio={24 / 40}
          className="h-full w-auto group-data-[open=true]:pointer-events-none"
        >
          <div className="stats-card relative grid h-full w-full grid-cols-1 grid-rows-[min-content_min-content_1fr_min-content] gap-4 overflow-hidden rounded-xl py-4">
            {/* min-content */}
            <div className="text-primary-foreground left-4 top-4 z-10 flex flex-col px-5">
              <div className="text-h3 pt-4">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-h5 uppercase">{user.location?.city}</div>
            </div>

            {/* min-content */}
            <UserStats user={user} />

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
                onClick={createShareLink(
                  `Motiion - ${user.firstName} ${user.lastName}`,
                  'Check out my profile on Motiion, the network for dancers.',
                  `/talent/${user._id}`
                )}
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
        </AspectRatio>
      </ReactCardFlip>
    </AspectRatio>
  )
}
