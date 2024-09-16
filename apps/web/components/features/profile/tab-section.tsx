import { FC } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion } from '@/components/ui/accordion'
import { SizingCard } from './sizing'
import { UserDoc } from '@packages/backend/convex/validators/users'
import { RepresentationCard } from './representation-card'
import { AttributesCard } from './attributes-card'
import { ReelCard } from './reel-card'
import { SocialLinksCard } from './socials-card'
import { OtherLinksCard } from './other-links-card'
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
}

export const TabSection: React.FC<TabSectionProps> = async ({ user }) => {
  return (
    <Tabs defaultValue="resume" className="mt-1">
      <TabsList className="sticky top-16 z-10 mb-4 grid w-full grid-cols-3 rounded-full">
        <TabsTrigger className="rounded-full" value="resume">
          Resume
        </TabsTrigger>
        <TabsTrigger className="rounded-full" value="about">
          About
        </TabsTrigger>
        <TabsTrigger className="rounded-full" value="links">
          Links
        </TabsTrigger>
      </TabsList>

      {/* RESUME */}
      <TabsContent value="resume" className="grid gap-3">
        <ResumeLinksTab user={user} />
      </TabsContent>

      {/* ABOUT */}
      <AccordionTab value="about">
        <AttributesCard user={user} />
        <SizingCard user={user} />
        <RepresentationCard agencyId={user.representation?.agencyId} />
      </AccordionTab>

      {/* LINKS */}
      <AccordionTab value="links">
        <ReelCard user={user} />
        <SocialLinksCard user={user} />
        <OtherLinksCard user={user} />
      </AccordionTab>
    </Tabs>
  )
}
