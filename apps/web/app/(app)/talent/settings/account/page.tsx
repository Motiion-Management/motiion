import { AccountDetailsFormProvider } from './form'
import { me } from '@/lib/server/users'

export default async function Account() {
  const user = await me()

  return <AccountDetailsFormProvider user={user}></AccountDetailsFormProvider>
}
