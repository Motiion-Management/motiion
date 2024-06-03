'use client'

import { AccordionCard } from '@/components/ui/accordion-card'
import { ResumeDoc } from '@packages/backend/convex/resumes'
import Image from 'next/image'
import FilmIcon from '@/public/Film_Reel.svg'
import ReactPlayer from 'react-player/lazy'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { AccordionContent } from '@/components/ui/accordion'

export const ReelCard: React.FC<{ resume: ResumeDoc }> = ({ resume }) => {
  return (
    <>
      {resume?.links?.reel && (
        <AccordionCard
          title="Reel"
          withParent
          startIconSlot={
            <Image width={20} height={20} alt="film reel icon" src={FilmIcon} />
          }
        >
          <AccordionContent>
            <AspectRatio ratio={16 / 9}>
              <div className="mt-4 overflow-clip rounded-lg">
                <ReactPlayer
                  playsinline
                  width="100%"
                  height="auto"
                  controls
                  config={{
                    youtube: {
                      playerVars: {
                        start: 113
                      }
                    }
                  }}
                  url={resume?.links?.reel || ''}
                />
              </div>
            </AspectRatio>
          </AccordionContent>
        </AccordionCard>
      )}
    </>
  )
}
