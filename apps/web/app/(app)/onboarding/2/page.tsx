import { fetchQuery } from 'convex/nextjs'
import { api } from '@packages/backend/convex/_generated/api'
import { PersonalDetailsFormProvider } from './form'
import { getAuthToken } from '@/lib/server/utils'

export default async function Onboarding1() {
  const token = await getAuthToken()
  const data = await fetchQuery(api.users.getMyUser, {}, { token })

  const defaultValues = data ?? {}

  return (
    <section>
      <PersonalDetailsFormProvider
        id={data!._id!}
        defaultValues={defaultValues}
      ></PersonalDetailsFormProvider>
    </section>
  )
}
