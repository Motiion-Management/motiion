import { FC } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Image from 'next/image'
import Link from 'next/link'
import { Accordion } from '@/components/ui/accordion'
import { Card } from '@/components/ui/card'
import { ChevronRight } from 'lucide-react'
import FilmIcon from '@/public/Film_Reel.svg'
import VideoIcon from '@/public/Video.svg'
import CommercialIcon from '@/public/Commercial.svg'
import LiveIcon from '@/public/Theatre_Mask.svg'
import TrainingIcon from '@/public/Classroom.svg'
import SkillsIcon from '@/public/Layers.svg'

import { SizingCard } from './sizing'
import { ResumeDoc } from '@packages/backend/convex/resumes'
import { UserDoc } from '@packages/backend/convex/users'
import { RepresentationCard } from './representation-card'
import { AttributesCard } from './attributes-card'
import { ReelCard } from './reel-card'
import { SocialLinksCard } from './socials-card'
import { PortfolioLinksCard } from './portfolio-links-card'
import { ResumeLinksTab } from './resume-links-tab'

const AccordionTab: FC<{
  children?: React.ReactNode
  value: string
}> = ({ children, value }) => {
  return (
    <TabsContent value={value} asChild>
      <Accordion type="single" collapsible className="grid gap-3">
        {children}
      </Accordion>
    </TabsContent>
  )
}

const resumeItems = [
  {
    icon: FilmIcon,
    href: '/talent/profile/television-film',
    text: 'Television/Film',
    preview: ''
  },
  {
    icon: VideoIcon,
    href: '/talent/profile/music-videos',
    text: 'Music Videos',
    preview: ''
  },
  {
    icon: LiveIcon,
    href: '/talent/profile/live-performances',
    text: 'Live/Stage Performances',
    preview: ''
  },
  {
    icon: CommercialIcon,
    href: '/talent/profile/commercials',
    text: 'Commercials',
    preview: ''
  },
  {
    icon: TrainingIcon,
    href: '/talent/profile/training-education',
    text: 'Training/Education',
    preview: ''
  },
  {
    icon: SkillsIcon,
    href: '/talent/profile/skills',
    text: 'Skills',
    preview: ''
  }
]
type TabSectionProps = {
  user: UserDoc
  resume: ResumeDoc
}

export const TabSection: React.FC<TabSectionProps> = async ({
  user,
  resume
}) => {
  return (
    <Tabs defaultValue="about" className="mt-1">
      <TabsList className="sticky top-16 z-10 mb-4 grid w-full grid-cols-3 rounded-full">
        <TabsTrigger className="rounded-full" value="about">
          About
        </TabsTrigger>
        <TabsTrigger className="rounded-full" value="resume">
          Resume
        </TabsTrigger>
        <TabsTrigger className="rounded-full" value="links">
          Links
        </TabsTrigger>
      </TabsList>

      {/* ABOUT */}
      <AccordionTab value="about">
        <AttributesCard user={user} resume={resume} />
        <SizingCard sizing={resume?.sizing} />
        <RepresentationCard agencyId={resume?.representation} />
      </AccordionTab>

      {/* RESUME */}
      <TabsContent value="resume" className="grid gap-3">
        <ResumeLinksTab userId={user._id} />
      </TabsContent>

      {/* LINKS */}
      <AccordionTab value="links">
        <ReelCard resume={resume} />
        <SocialLinksCard resume={resume} />
        <PortfolioLinksCard resume={resume} />
      </AccordionTab>
    </Tabs>
  )
}
