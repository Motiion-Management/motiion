import { HeadshotCarousel } from '@/components/features/headshot-carousel'
import { getMyExperienceCounts } from '@/lib/server/resumes'
import { LinkSection } from './link-section'
import { AboutLinks } from './about-links'
import { preloadMe } from '@/lib/server/users'
import { ProfileTipAlert } from './profile-tip-alert'

export default async function ProfilePage() {
  const [preloadedUser, user] = await preloadMe()

  const counts = await getMyExperienceCounts()

  const resumeLinks = [
    ...counts.map(({ count, title, slug }) => ({
      href: `/talent/profile/edit/resume/${slug}`,
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
      {!user.profileTipDismissed && (
        <ProfileTipAlert preloadedUser={preloadedUser} />
      )}

      <HeadshotCarousel title="Your Headshots" />

      <LinkSection title="Resume" links={resumeLinks} />

      <AboutLinks user={user} />

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
            preview: Object.values(user.links?.socials || {}).length.toString()
          },
          {
            href: '/talent/profile/edit/links/other',
            text: 'Other',
            preview: user.links?.other?.length.toString()
          }
        ]}
      />
    </div>
  )
}
