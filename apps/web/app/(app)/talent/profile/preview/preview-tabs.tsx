import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toDate, differenceInYears, endOfToday } from 'date-fns'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from '@/components/ui/accordion'
import { useQuery } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import {
  Card,
  CardContent,
  CardDescription,
  
} from '@/components/ui/card'
import './preview-tabs.css'

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
      <div className="text-h4 text-secondary uppercase leading-10">{label}</div>
      <p className="text-label-s uppercase tracking-[0.6px]">{value}</p>
    </div>
  )
}

type PreviewTabsProps = {
  snapTarget?: string;
  style?: React.CSSProperties;
}

export const PreviewTabs: React.FC<PreviewTabsProps> = ({ snapTarget, style }) => {
  const userStats = useQuery(api.resumes.getMyStats)
  console.log(userStats)
  return (
    <Tabs style={style} defaultValue="account" className={`mt-[175%] ${snapTarget}`}>
      <TabsList className="grid w-full grid-cols-3 rounded-full">
        <TabsTrigger className="rounded-full" value="account">
          About
        </TabsTrigger>
        <TabsTrigger className="rounded-full" value="password">
          Resume
        </TabsTrigger>
        <TabsTrigger className="rounded-full" value="links">
          Links
        </TabsTrigger>
      </TabsList>
      <TabsContent value="account" className="border-none">
        <Accordion type="single" collapsible>
          <AccordionItem value="attributes" title="attributes">
            <Card className="p-6">
              <AccordionTrigger className="accordion-trigger text-lg">
                Attributes
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="pl-0">
                  <CardDescription>
                    <Stat label="Ethnicity" value="White/Caucasian" />
                    <Stat label="Height" value={userStats?.height} />
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
          <AccordionItem value="Representation" title="Representation">
            <Card className="p-6">
              <AccordionTrigger className="text-lg no-underline">
                Representation
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
          <AccordionItem value="Sizing" title="Sizing">
            <Card className="p-6">
              <AccordionTrigger className="text-lg ">Sizing</AccordionTrigger>
              <AccordionContent>
                <CardContent className="pl-0">
                  <CardDescription>
                    <Stat label="Height" value={userStats?.height} />
                    <Stat label="Waist" value={userStats?.waist} />
                    <Stat label="Shoes" value={userStats?.shoes} />
                    <Stat label="Chest" value={userStats?.chest} />
                    <Stat label="Jacket" value={userStats?.jacket} />
                  </CardDescription>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>
        </Accordion>
      </TabsContent>
    </Tabs>
  )
}
