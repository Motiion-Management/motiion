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
import { Id } from '@packages/backend/convex/_generated/dataModel'

export const ResumeLinksTab: React.FC<{ userId: Id<'users'> }> = ({
  userId
}) => {
  const profilePath = `/talent/${userId}`
  const resumeItems = [
    {
      icon: FilmIcon,
      href: profilePath + '/television-film',
      text: 'Television/Film',
      preview: ''
    },
    {
      icon: VideoIcon,
      href: profilePath + '/music-videos',
      text: 'Music Videos',
      preview: ''
    },
    {
      icon: LiveIcon,
      href: profilePath + '/live-performances',
      text: 'Live/Stage Performances',
      preview: ''
    },
    {
      icon: CommercialIcon,
      href: profilePath + '/commercials',
      text: 'Commercials',
      preview: ''
    },
    {
      icon: TrainingIcon,
      href: profilePath + '/training-education',
      text: 'Training/Education',
      preview: ''
    },
    {
      icon: SkillsIcon,
      href: profilePath + '/skills',
      text: 'Skills',
      preview: ''
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
