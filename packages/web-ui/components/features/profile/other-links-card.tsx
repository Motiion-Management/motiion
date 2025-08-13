import { AccordionCard } from '@/components/ui/accordion-card'
import Image from 'next/image'
import { AccordionContent } from '@/components/ui/accordion'
import { ExternalLink } from '@/components/ui/external-link'
import VideoIcon from '@/public/Video.svg'
import { UserDoc } from '@packages/backend/convex/validators/users'

export const OtherLinksCard: React.FC<{ user: UserDoc }> = ({ user }) => {
  return (
    <AccordionCard
      title="Other Links"
      withParent
      startIconSlot={
        <Image width={20} height={20} alt="video icon" src={VideoIcon} />
      }
    >
      <AccordionContent>
        <div className="mt-4 grid grid-cols-2 gap-4">
          {user?.links?.other?.map(({ label, url }) => (
            <ExternalLink key={url} href={url}>
              {label}
            </ExternalLink>
          ))}
        </div>
      </AccordionContent>
    </AccordionCard>
  )
}
