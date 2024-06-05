// import {  preloadMe } from '@/lib/server/users'
import { DisplayRepForm } from './display-rep-form'
import { RepresentationForm } from './form'
import { RepAlert } from './rep-alert'

export default async function ProfileEditRepresentationPage() {
  // const preloadedUser = await preloadMe()
  return (
    <div className="flex flex-col gap-4">
      <DisplayRepForm />
      <RepAlert />
      <RepresentationForm />
    </div>
  )
}
