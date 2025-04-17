import React from 'react'
import { AccordionCard } from '@/components/ui/accordion-card'
import { locationToString } from '@/lib/utils'
import { Id } from '@packages/backend/convex/_generated/dataModel'
import { fetchQuery } from 'convex/nextjs'
import { api } from '@packages/backend/convex/_generated/api'
import { Stat, StatGroup } from '../stats'
import { Email } from '@/components/ui/email'
import { AgencyDoc } from '@packages/backend/convex/agencies'

const NoAgency = { name: 'None' } as AgencyDoc

export const RepresentationCard: React.FC<{
  agencyId?: Id<'agencies'>
}> = async ({ agencyId }) => {
  const representation = agencyId
    ? await fetchQuery(api.agencies.read, { id: agencyId })
    : NoAgency
  return (
    <AccordionCard title="Representation" withParent>
      <StatGroup>
        <Stat label="Representation" value={representation?.name} />
        {representation?.location && (
          <Stat
            label="Address"
            value={locationToString(representation.location)}
          />
        )}
        {representation?.phone && (
          <Stat label="Phone" value={representation.phone} />
        )}
        {representation?.email && (
          <Stat
            label="Email"
            value={<Email address={representation.email || ''} />}
          />
        )}
      </StatGroup>
    </AccordionCard>
  )
}
