import { HeadshotCarousel } from '@/components/features/headshot-carousel'
import { AlertDescription } from '@/components/ui/alert'
import { DismissableAlert } from '@/components/ui/dismissable-alert'
import { InfoIcon as Info } from 'lucide-react'
import { LinkSection } from './link-section'
import { getMyResume } from '@/lib/server/resumes'
import { AboutLinks } from './about-links'

export default async function ProfilePage() {
  const resume = await getMyResume()
  return (
    <div className="grid w-full grid-cols-1 grid-rows-[repeat(5,min-content)] gap-8 overflow-x-visible">
      <DismissableAlert iconSlot={<Info />} variant="info">
        <AlertDescription>
          {`Use the toggle above to switch between "edit" and "preview" modes.`}
        </AlertDescription>
      </DismissableAlert>

      <HeadshotCarousel title="Your Headshots" />

      <AboutLinks resume={resume} />

      <LinkSection
        title="Resume"
        links={[
          {
            href: '/talent/profile/edit/resume/television-film',
            text: 'Television/Film',
            preview: resume.televisionAndFilm?.length.toString()
          },
          {
            href: '/talent/profile/edit/resume/music-videos',
            text: 'Music Videos',
            preview: resume.musicVideos?.length.toString()
          },
          {
            href: '/talent/profile/edit/resume/live-performances',
            text: 'Live/Stage Performances',
            preview: resume.livePerformances?.length.toString()
          },
          {
            href: '/talent/profile/edit/resume/commercials',
            text: 'Commercials',
            preview: resume.commercials?.length.toString()
          },
          {
            href: '/talent/profile/edit/resume/training-education',
            text: 'Training/Education',
            preview: resume.training?.length.toString()
          },
          {
            href: '/talent/profile/edit/skills',
            text: 'Skills',
            preview: resume.skills?.length.toString()
          }
        ]}
      />
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
            preview: resume.links?.socials?.length.toString()
          },
          {
            href: '/talent/profile/edit/links/other',
            text: 'Other',
            preview: resume.links?.portfolio?.length.toString()
          }
        ]}
      />
    </div>
  )
}
