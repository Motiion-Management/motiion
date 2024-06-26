import { AccordionCard } from '@/components/ui/accordion-card'
import Image from 'next/image'
import WorldIcon from '@/public/Geography.svg'
import { AccordionContent } from '@/components/ui/accordion'
import { SocialLink, SocialLinkProps } from '@/components/ui/social-link'
import { UserDoc } from '@packages/backend/convex/validators/users'

export const SocialLinksCard: React.FC<{ user: UserDoc }> = ({ user }) => {
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
          {Object.entries(user?.links?.socials || {}).map(
            ([platform, link]) => (
              <SocialLink
                key={platform}
                link={link}
                platform={platform as SocialLinkProps['platform']}
              />
            )
          )}
        </div>
      </AccordionContent>
    </AccordionCard>
  )
}
