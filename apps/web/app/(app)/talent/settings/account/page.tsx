import { AccountDetailsFormProvider } from './form'
import { meX } from '@/lib/server/users'

export default async function Account() {
  const user = await meX()

  return <AccountDetailsFormProvider user={user}></AccountDetailsFormProvider>
}
