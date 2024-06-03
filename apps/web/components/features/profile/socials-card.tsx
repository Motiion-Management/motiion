import { AccordionCard } from '@/components/ui/accordion-card'
import { ResumeDoc } from '@packages/backend/convex/resumes'
import Image from 'next/image'
import WorldIcon from '@/public/Geography.svg'
import { AccordionContent } from '@/components/ui/accordion'
import { SocialLink, SocialLinkProps } from '@/components/ui/social-link'

export const SocialLinksCard: React.FC<{ resume: ResumeDoc }> = ({
  resume
}) => {
  return (
    <AccordionCard
      title="Socials"
      withParent
      startIconSlot={
        <Image width={20} height={20} alt="world icon" src={WorldIcon} />
      }
    >
      <AccordionContent>
        <div className="mt-4 flex gap-4">
          {resume?.links?.socials?.map(({ link, platform }) => (
            <SocialLink
              key={platform}
              link={link}
              platform={platform as SocialLinkProps['platform']}
            />
          ))}
        </div>
      </AccordionContent>
    </AccordionCard>
  )
}
