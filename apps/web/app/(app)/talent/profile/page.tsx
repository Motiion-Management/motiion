import { AlertDescription } from '@/components/ui/alert'
import { DismissableAlert } from '@/components/ui/dismissable-alert'
import { myHeadshots } from '@/lib/server/resumes'
import { me } from '@/lib/server/users'
import { InfoIcon as Info } from 'lucide-react'

export default async function ProfilePage() {
  const user = await me()
  const headshots = await myHeadshots()
  return (
    <div className="flex w-full flex-col gap-2">
      <DismissableAlert iconSlot={<Info />} variant="info">
        <AlertDescription>
          Use the toggle above to switch between "edit" and "preview" modes.
        </AlertDescription>
      </DismissableAlert>
    </div>
  )
}
