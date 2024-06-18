'use client'
import { Id } from '@packages/backend/convex/_generated/dataModel'
import { api } from '@packages/backend/convex/_generated/api'
import { useQuery } from 'convex/react'
import Image from 'next/image'

export const RepLogo: React.FC<{ id: Id<'agencies'> }> = ({ id }) => {
  const agency = useQuery(api.agencies.getAgency, {
    id
  })
  return (
    <>
      {agency?.logoUrl && (
        <Image
          width={50}
          height={30}
          src={agency.logoUrl}
          alt={agency.shortName || agency.name}
        />
      )}
    </>
  )
}
