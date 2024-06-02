'use client'
import { FC } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toDate, differenceInYears, endOfToday } from 'date-fns'
import ReactPlayer from 'react-player'
import Image from 'next/image'
import Link from 'next/link'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from '@/components/ui/accordion'
import { useQuery } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import { Card, CardContent, CardDescription } from '@/components/ui/card'
import './preview-tabs.css'
import { ChevronRight } from 'lucide-react'
import FilmIcon from '@/public/Film_Reel.svg'
import VideoIcon from '@/public/Video.svg'
import CommercialIcon from '@/public/Commercial.svg'
import LiveIcon from '@/public/Theatre_Mask.svg'
import TrainingIcon from '@/public/Classroom.svg'
import SkillsIcon from '@/public/Layers.svg'
import { AccordionCard } from '@/components/ui/accordion-card'
import { cn, formatHeight } from '@/lib/utils'
import { Email } from '@/components/ui/email'
import { Sizing } from './sizing'
import { Stat, StatGroup } from '@/components/features/stats'

const calculateAge = (dateOfBirth?: string | null) => {
  if (!dateOfBirth) {
    return
  }
  const dob = toDate(dateOfBirth)
  return differenceInYears(endOfToday(), dob)
}
const TabLayout: FC<{
  children?: React.ReactNode
  value: string
}> = ({ children, value }) => {
  return (
    <TabsContent value={value} asChild>
      <Accordion
        type="single"
        collapsible
        className="grid gap-4 border-none pt-2"
      >
        {children}
      </Accordion>
    </TabsContent>
  )
}

type PreviewTabsProps = {
  style?: React.CSSProperties
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
function locationToString(location?: {
  city: string
  state: string
  country: string
  address?: string
  zipCode?: string
}) {
  if (!location) {
    return ''
  }
  return `${location.address} ${location.city}, ${location.state} ${location.zipCode}`.trim()
}
export const PreviewTabs: React.FC<PreviewTabsProps> = () => {
  const userStats = useQuery(api.resumes.getMyStats)
  const sizing = useQuery(api.resumes.getMySizes)
  return (
    <Tabs defaultValue="about" className="mt-1">
      <TabsList className="sticky top-16 z-10 grid w-full grid-cols-3 rounded-full">
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
      <TabLayout value="about">
        <AccordionCard title="Attributes" withParent>
          <StatGroup cols={2}>
            <Stat label="Age" value={calculateAge(userStats?.dateOfBirth)} />
            <Stat label="Height" value={formatHeight(userStats?.height)} />
            <Stat label="Eyes" value={userStats?.eyeColor} />
            <Stat label="Hair Color" value={userStats?.hairColor} />
            <Stat label="Ethnicity" value="White/Caucasian" />
            <div />
          </StatGroup>
        </AccordionCard>
        <Sizing sizing={sizing?.sizing} />
        <AccordionCard title="Representation" withParent>
          <StatGroup>
            <Stat
              label="Representation"
              value={userStats?.representation?.name}
            />
            <Stat
              label="Address"
              value={locationToString(userStats?.representation?.location)}
            />
            <Stat label="Phone" value={userStats?.representation?.phone} />
            <Stat
              label="Email"
              value={<Email address={userStats?.representation?.email || ''} />}
            />
          </StatGroup>
        </AccordionCard>
      </TabLayout>
      <TabsContent value="resume">
        {resumeItems.map((item, key) => (
          <Link href={item.href} key={key}>
            <Card className="my-3">
              <CardContent className="flex items-center justify-between pt-5">
                <div className="flex gap-2">
                  <Image width={20} height={20} alt="Icon" src={item.icon} />
                  {item.text}
                </div>
                <ChevronRight size={20} />
              </CardContent>
            </Card>
          </Link>
        ))}
      </TabsContent>
      <TabsContent value="links">
        <Accordion type="single" collapsible>
          <AccordionItem className="pb-6" value="reel" title="reel">
            <Card className="p-6">
              <AccordionTrigger className="accordion-trigger justify-between text-lg">
                Reel <ChevronRight size={20} />
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="pl-0">
                  <ReactPlayer
                    width="100%"
                    height="400px"
                    controls={true}
                    url={userStats?.reel || ''}
                  />
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>
          <AccordionItem value="socials" title="socials" className="pb-6">
            <Card className="p-6">
              <AccordionTrigger className="justify-between text-lg no-underline">
                Socials <ChevronRight size={20} />
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="pl-0">
                  <CardDescription>My Socials</CardDescription>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>
          <AccordionItem value="portfolio" title="portfolio" className="pb-6">
            <Card className="p-6">
              <AccordionTrigger className="justify-between text-lg">
                Portfolio <ChevronRight size={20} />
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="pl-0">My portfolio</CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>
        </Accordion>
      </TabsContent>
    </Tabs>
  )
}
