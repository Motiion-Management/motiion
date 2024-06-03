import React from 'react'
import { AccordionCard } from '@/components/ui/accordion-card'
import { ResumeDoc } from '@packages/backend/convex/resumes'
import { UserDoc } from '@packages/backend/convex/users'
import { Stat, StatGroup } from '@/components/features/stats'
import { calculateAge, formatHeight } from '@/lib/utils'

export const AttributesCard: React.FC<{ user: UserDoc; resume: ResumeDoc }> = ({
  user,
  resume
}) => {
  return (
    <AccordionCard title="Attributes" withParent>
      <StatGroup cols={2}>
        <Stat label="Age" value={calculateAge(user?.dateOfBirth)} />
        <Stat label="Height" value={formatHeight(resume?.height)} />
        <Stat label="Eyes" value={resume?.eyeColor} />
        <Stat label="Hair Color" value={resume?.hairColor} />
        <Stat label="Ethnicity" value="White/Caucasian" />
        <div />
      </StatGroup>
    </AccordionCard>
  )
}
