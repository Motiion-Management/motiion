import { HeadshotCarousel } from '@/components/features/headshot-carousel'
import { AlertDescription } from '@/components/ui/alert'
import { DismissableAlert } from '@/components/ui/dismissable-alert'
import { InfoIcon as Info } from 'lucide-react'
import { LinkSection } from './link-section'

export default async function ProfilePage() {
  return (
    <div className="grid w-full grid-cols-1 grid-rows-[repeat(5,min-content)] gap-8 overflow-x-visible">
      <DismissableAlert iconSlot={<Info />} variant="info">
        <AlertDescription>
          {`Use the toggle above to switch between "edit" and "preview" modes.`}
        </AlertDescription>
      </DismissableAlert>

      <HeadshotCarousel title="Your Headshots" />

      <LinkSection
        title="About"
        links={[
          {
            href: '/talent/profile/edit/about/representation',
            text: 'Representation',
            preview: 'Block LA'
          },
          {
            href: '/talent/profile/edit/about/attributes',
            text: 'Attributes'
          },
          {
            href: '/talent/profile/edit/about/sizing',
            text: 'Sizing'
          }
        ]}
      />
      <LinkSection
        title="Resume"
        links={[
          {
            href: '/talent/profile/edit/resume/television-film',
            text: 'Television/Film',
            preview: '4'
          },
          {
            href: '/talent/profile/edit/resume/music-videos',
            text: 'Music Videos',
            preview: '8'
          },
          {
            href: '/talent/profile/edit/resume/live-performances',
            text: 'Live/Stage Performances',
            preview: '25'
          },
          {
            href: '/talent/profile/edit/resume/commercials',
            text: 'Commercials',
            preview: '3'
          },
          {
            href: '/talent/profile/edit/resume/training-education',
            text: 'Training/Education',
            preview: '2'
          },
          {
            href: '/talent/profile/edit/skills',
            text: 'Skills',
            preview: '11'
          }
        ]}
      />
      <LinkSection
        title="Links"
        links={[
          {
            href: '/talent/profile/edit/links/reels',
            text: 'Reels',
            preview: '1'
          },
          {
            href: '/talent/profile/edit/links/socials',
            text: 'Socials',
            preview: '4'
          },
          {
            href: '/talent/profile/edit/links/other',
            text: 'Other',
            preview: '1'
          }
        ]}
      />
    </div>
  )
}
