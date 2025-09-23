'use client'

import { AccordionCard } from '@/components/ui/accordion-card'
import Image from 'next/image'
import FilmIcon from '@/public/Film_Reel.svg'
import { AccordionContent } from '@/components/ui/accordion'
import { UserDoc } from '@packages/backend/convex/schemas/users'
import { Video } from '@/components/ui/video'

export const ReelCard: React.FC<{ user: UserDoc }> = ({ user }) => {
  return (
    <>
      {user?.links?.reel && (
        <AccordionCard
          title="Reel"
          withParent
          startIconSlot={
            <Image width={20} height={20} alt="film reel icon" src={FilmIcon} />
          }
        >
          <AccordionContent>
            <Video url={user?.links?.reel || ''} />
          </AccordionContent>
        </AccordionCard>
      )}
    </>
  )
}
