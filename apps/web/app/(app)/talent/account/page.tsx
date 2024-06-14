import { fetchQuery } from 'convex/nextjs'
import { api } from '@packages/backend/convex/_generated/api'
import { AccountDetailsFormProvider } from './form'
import { getAuthToken } from '@/lib/server/utils'

export default async function Account() {
  const token = await getAuthToken()
  const data = await fetchQuery(api.users.getMyUser, {}, { token })

  const defaultValues = data ?? {}

  return (
    <section className="w-full">
       <div className="mx-auto w-full max-w-6xl gap-2 pb-5">
          <h1 className="text-2xl font-semibold">Account</h1>
          <p className="text-xs uppercase">Settings</p>
        </div>
      <AccountDetailsFormProvider
        id={data!._id!}
        defaultValues={defaultValues}
      ></AccountDetailsFormProvider>
    </section>
  )
}