'use client'
import { DismissableAlert } from '@/components/ui/dismissable-alert'
import { AlertDescription } from '@/components/ui/alert'
import { InfoIcon as Info } from 'lucide-react'
import { api } from '@packages/backend/convex/_generated/api'
import { useMutation, Preloaded, usePreloadedQuery } from 'convex/react'

export const RepAlert: React.FC<{
  preloadedUser: Preloaded<typeof api.users.getMyUser>
}> = ({ preloadedUser }) => {
  const user = usePreloadedQuery(preloadedUser)
  const updateMyUser = useMutation(api.users.updateMyUser)
  function dismissAlert() {
    updateMyUser({
      representation: {
        ...user?.representation,
        tipDismissed: true
      }
    })
  }

  if (!user?.representation?.displayRep || user?.representation?.tipDismissed) {
    return
  }
  return (
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
  )
}
