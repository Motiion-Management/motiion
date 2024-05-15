import { me } from '@/lib/server/users'
// import { Header } from '@/components/ui/header'
// import { Circle } from 'lucide-react'

export default async function ProfilePage() {
  const user = await me()
  return (
    <div className="flex w-full flex-col gap-2">
      {/* <Header title="Profile" actionSlot={<Circle />}> */}
      {/*   ------test------- */}
      {/* </Header> */}
    </div>
  )
}
