import { InfoIcon as Info } from 'lucide-react'
import { HeadshotCarousel } from '@/components/features/headshot-carousel'
import { AlertDescription } from '@/components/ui/alert'
import { DismissableAlert } from '@/components/ui/dismissable-alert'
import { getMyExperienceCounts } from '@/lib/server/resumes'
import { LinkSection } from './link-section'
import { AboutLinks } from './about-links'
import { me } from '@/lib/server/users'

export default async function ProfilePage() {
  const user = await me()

  const counts = await getMyExperienceCounts()

  const resumeLinks = [
    ...counts.map(({ count, title }) => ({
      href: `/talent/profile/edit/resume/${title}`,
      text: title,
      preview: count.toString()
    })),
    {
      href: '/talent/profile/edit/resume/skills',
      text: 'Skills',
      preview: Object.values(user.resume?.skills || { expert: [] })
        .reduce((aggr, skillSet) => aggr + skillSet.length, 0)
        .toString()
    }
  ]
  return (
    <div className="grid w-full grid-cols-1 grid-rows-[repeat(5,min-content)] gap-8 overflow-x-visible">
      <DismissableAlert iconSlot={<Info />} variant="info">
        <AlertDescription>
          {`Use the toggle above to switch between "edit" and "preview" modes.`}
        </AlertDescription>
      </DismissableAlert>

      <HeadshotCarousel title="Your Headshots" />

      <AboutLinks user={user} />

      <LinkSection title="Resume" links={resumeLinks} />
      <LinkSection
        title="Links"
        links={[
          {
            href: '/talent/profile/edit/links/reels',
            text: 'Reels'
          },
          {
            href: '/talent/profile/edit/links/socials',
            text: 'Socials',
            preview: user.links?.socials?.length.toString()
          },
          {
            href: '/talent/profile/edit/links/other',
            text: 'Other',
            preview: user.links?.portfolio?.length.toString()
          }
        ]}
      />
    </div>
  )
}
