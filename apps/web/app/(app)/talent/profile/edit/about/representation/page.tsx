import { DisplayRepForm } from './display-rep-form'
import { RepAlert } from './rep-alert'

export default async function ProfileEditRepresentationPage() {
  return (
    <div className="flex flex-col gap-4">
      <DisplayRepForm />
      <RepAlert />
    </div>
  )
}
