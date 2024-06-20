'use client'
import { DismissableAlert } from '@/components/ui/dismissable-alert'
import { AlertDescription } from '@/components/ui/alert'
import { InfoIcon as Info } from 'lucide-react'
import { api } from '@packages/backend/convex/_generated/api'
import { useMutation, Preloaded, usePreloadedQuery } from 'convex/react'
import { AnimatePresence, motion } from 'framer-motion'

export const ProfileTipAlert: React.FC<{
  preloadedUser: Preloaded<typeof api.users.getMyUser>
}> = ({ preloadedUser }) => {
  const user = usePreloadedQuery(preloadedUser)
  const updateMyUser = useMutation(api.users.updateMyUser)
  function dismissAlert() {
    updateMyUser({
      profileTipDismissed: true
    })
  }

  if (user?.profileTipDismissed) {
    return
  }
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <DismissableAlert
          iconSlot={<Info />}
          variant="info"
          onDismiss={dismissAlert}
        >
          <AlertDescription>
            {`Use the toggle above to switch between "edit" and "preview" modes.`}
          </AlertDescription>
        </DismissableAlert>
      </motion.div>
    </AnimatePresence>
  )
}
