import { AccordionCard } from '@/components/ui/accordion-card'
import Image from 'next/image'
import { AccordionContent } from '@/components/ui/accordion'
import { ExternalLink } from '@/components/ui/external-link'
import VideoIcon from '@/public/Video.svg'
import { UserDoc } from '@packages/backend/convex/validators/users'

export const PortfolioLinksCard: React.FC<{ user: UserDoc }> = ({ user }) => {
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
          {user?.links?.portfolio?.map(({ title, link }) => (
            <ExternalLink key={title} href={link}>
              {title}
            </ExternalLink>
          ))}
        </div>
      </AccordionContent>
    </AccordionCard>
  )
}
