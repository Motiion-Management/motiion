import React from 'react'
import { AccordionCard } from '@/components/ui/accordion-card'
import { UserDoc } from '@packages/backend/convex/validators/users'
import { Stat, StatGroup } from '@/components/features/stats'
import { calculateAge, formatHeight } from '@/lib/utils'

export const AttributesCard: React.FC<{ user: UserDoc }> = ({ user }) => {
  return (
    <AccordionCard title="Attributes" withParent>
      <StatGroup cols={2}>
        <Stat label="Age" value={calculateAge(user.dateOfBirth)} />
        <Stat label="Height" value={formatHeight(user.attributes?.height)} />
        <Stat label="Eyes" value={user.attributes?.eyeColor} />
        <Stat label="Hair Color" value={user.attributes?.hairColor} />
        <Stat label="Ethnicity" value={user.attributes?.ethnicity} />
        <div />
      </StatGroup>
    </AccordionCard>
  )
}
