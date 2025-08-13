import { api } from '@packages/backend/convex/_generated/api'
import { Id } from '@packages/backend/convex/_generated/dataModel'
import { useQuery } from 'convex/react'

export const AgencyName: React.FC<{ id: Id<'agencies'> }> = ({ id }) => {
  const agency = useQuery(api.agencies.getAgency, { id })
  return <>{agency?.name}</>
}
