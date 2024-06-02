'use client'
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

const calculateAge = (dateOfBirth?: string | null) => {
  if (!dateOfBirth) {
    return
  }
  const dob = toDate(dateOfBirth)
  return differenceInYears(endOfToday(), dob)
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-col border-b-2 pb-4 text-left">
      <div className="text-secondary text-xs font-medium uppercase leading-10">
        {label}
      </div>
      <p className="text-label-s uppercase tracking-[0.6px]">{value}</p>
    </div>
  )
}

type PreviewTabsProps = {
  // snapTarget?: string
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
export const PreviewTabs: React.FC<PreviewTabsProps> = ({
  // snapTarget,
  style
}) => {
  const userStats = useQuery(api.resumes.getMyStats)
  console.log(userStats)
  return (
    <Tabs style={style} defaultValue="about">
      <TabsList className="grid w-full grid-cols-3 rounded-full">
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
      <TabsContent value="about" className="border-none">
        <Accordion type="single" collapsible>
          <AccordionItem className="my-6" value="attributes" title="attributes">
            <Card className="p-6">
              <AccordionTrigger className="accordion-trigger justify-between text-lg">
                Attributes <ChevronRight size={20} />
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="pl-0">
                  <CardDescription>
                    <Stat label="Ethnicity" value="White/Caucasian" />
                    {/* <Stat label="Height" value={userStats?.height} /> */}
                    <Stat label="Eyes" value={userStats?.eyeColor} />
                    <Stat label="Hair Color" value={userStats?.hairColor} />
                    <Stat
                      label="Age"
                      value={calculateAge(userStats?.dateOfBirth)}
                    />
                  </CardDescription>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>
          <AccordionItem
            value="Representation"
            title="Representation"
            className="pb-6"
          >
            <Card className="p-6">
              <AccordionTrigger className="justify-between text-lg no-underline">
                Representation <ChevronRight size={20} />
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="pl-0">
                  <CardDescription>
                    <Stat
                      label="Representation"
                      value={userStats?.representation?.name}
                    />
                  </CardDescription>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>
          <AccordionItem value="Sizing" title="Sizing" className="pb-6">
            <Card className="p-6">
              <AccordionTrigger className="justify-between text-lg">
                Sizing <ChevronRight size={20} />
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="pl-0">
                  <CardDescription>
                    {/* <Stat label="Height" value={userStats?.height} /> */}
                    {/* <Stat label="Waist" value={userStats?.waist} /> */}
                    {/* <Stat label="Shoes" value={userStats?.shoes} /> */}
                    {/* <Stat label="Chest" value={userStats?.chest} /> */}
                    {/* <Stat label="Jacket" value={userStats?.jacket} /> */}
                  </CardDescription>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>
        </Accordion>
      </TabsContent>
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
