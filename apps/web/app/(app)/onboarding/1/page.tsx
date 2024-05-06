import { fetchQuery } from 'convex/nextjs'
import { api } from '@packages/backend/convex/_generated/api'
import { PersonalDetailsFormProvider } from './form'
import { getAuthToken } from '@/lib/server/utils'

export default async function Onboarding1() {
  const token = await getAuthToken()
  const data = await fetchQuery(api.users.getMyUser, {}, { token })

  const defaultValues = data
    ? {
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        displayName: data.displayName || '',
        dateOfBirth: data.dateOfBirth || '',
        gender: data.gender || '',
        phone: data.phone || '',
        location: data.location
      }
    : {}

  return (
    <section>
      <PersonalDetailsFormProvider
        defaultValues={defaultValues}
      ></PersonalDetailsFormProvider>
    </section>
  )
}
