import { FC } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion } from '@/components/ui/accordion'
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
