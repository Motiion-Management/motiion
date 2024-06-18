import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { ChevronRight } from 'lucide-react'
import FilmIcon from '@/public/Film_Reel.svg'
import VideoIcon from '@/public/Video.svg'
import CommercialIcon from '@/public/Commercial.svg'
import LiveIcon from '@/public/Theatre_Mask.svg'
import TrainingIcon from '@/public/Classroom.svg'
import SkillsIcon from '@/public/Layers.svg'
import { fetchUserPublicExperienceCounts } from '@/lib/server/resumes'
import { UserDoc } from '@packages/backend/convex/validators/users'

export const ResumeLinksTab: React.FC<{
  user: UserDoc
}> = async ({ user }) => {
  const counts = await fetchUserPublicExperienceCounts(user._id)

  const profilePath = `/talent/${user._id}`

  const icons = {
    'television-film': FilmIcon,
    'music-videos': VideoIcon,
    'live-performances': LiveIcon,
    commercials: CommercialIcon,
    training: TrainingIcon
  }
  const resumeItems = [
    ...counts.map(({ count, title, slug }) => ({
      href: [profilePath, slug].join('/'),
      text: title,
      icon: icons[slug],
      preview: count.toString()
    })),
    {
      href: profilePath + '/skills',
      text: 'Skills',
      icon: SkillsIcon,
      preview: Object.values(user.resume?.skills || { expert: [] })
        .reduce((aggr, skillSet) => aggr + skillSet.length, 0)
        .toString()
    }
  ]

  return (
    <>
      {resumeItems.map((item, key) => (
        <Link href={item.href} key={key}>
          <Card className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2">
              <Image width={20} height={20} alt="Icon" src={item.icon} />
              <h5 className="text-h5">{item.text}</h5>
            </div>
            <ChevronRight size={16} />
          </Card>
        </Link>
      ))}
    </>
  )
}
