'use client'
import { DismissableAlert } from '@/components/ui/dismissable-alert'
import { AlertDescription } from '@/components/ui/alert'
import { InfoIcon as Info } from 'lucide-react'
import { api } from '@packages/backend/convex/_generated/api'
import { useMutation, useQuery } from 'convex/react'

export const RepAlert: React.FC = () => {
  const user = useQuery(api.users.getMyUser)
  const resume = useQuery(api.resumes.getMyResume)
  const updateMyUser = useMutation(api.users.updateMyUser)
  function dismissAlert() {
    updateMyUser({
      representationTip: true
    })
  }
  return !user?.representationTip && !resume?.displayRepresentation ? (
    <DismissableAlert
      iconSlot={<Info />}
      variant="info"
      onDismiss={dismissAlert}
    >
      <AlertDescription>
        You do not have representation listed on your account at this time.
        Check the box above to add information about your representation.
      </AlertDescription>
    </DismissableAlert>
  ) : null
}
