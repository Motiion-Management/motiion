import { AccordionCard } from '@/components/ui/accordion-card'
import { ResumeDoc } from '@packages/backend/convex/resumes'
import Image from 'next/image'
import { AccordionContent } from '@/components/ui/accordion'
import { ExternalLink } from '@/components/ui/external-link'
import VideoIcon from '@/public/Video.svg'

export const PortfolioLinksCard: React.FC<{ resume: ResumeDoc }> = ({
  resume
}) => {
  return (
    <AccordionCard
      title="Portfolio"
      withParent
      startIconSlot={
        <Image width={20} height={20} alt="video icon" src={VideoIcon} />
      }
    >
      <AccordionContent>
        <div className="mt-4 grid grid-cols-2 gap-4">
          {resume?.links?.portfolio?.map(({ title, link }) => (
            <ExternalLink key={title} href={link}>
              {title}
            </ExternalLink>
          ))}
        </div>
      </AccordionContent>
    </AccordionCard>
  )
}
