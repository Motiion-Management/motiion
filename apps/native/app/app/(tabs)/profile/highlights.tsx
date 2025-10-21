import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import { View } from 'react-native'

import { TabScreenLayout } from '~/components/layouts/TabScreenLayout'
import { Text } from '~/components/ui/text'
import { HighlightGrid } from '~/components/highlights/HighlightGrid'
import { AddHighlightSheet } from '~/components/highlights/AddHighlightSheet'
import { useSharedUser } from '~/contexts/SharedUserContext'

export default function HighlightsScreen() {
  const { user } = useSharedUser()
  const highlights = useQuery(api.highlights.getMyHighlights)
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false)

  const handleAddPress = () => {
    setIsAddSheetOpen(true)
  }

  return (
    <TabScreenLayout
      header={{
        left: 'back',
        middle: 'Highlights'
      }}>
      <View className="flex-1 gap-6 p-4">
        <Text variant="body" className="text-text-low">
          Select up to 10 highlights for your profile to help visitors quickly recognize
          your top credits.
        </Text>

        <HighlightGrid
          highlights={highlights ?? []}
          onAddPress={handleAddPress}
          isLoading={highlights === undefined}
        />
      </View>

      <AddHighlightSheet
        isOpen={isAddSheetOpen}
        onOpenChange={setIsAddSheetOpen}
        profileId={user?.activeDancerId ?? null}
      />
    </TabScreenLayout>
  )
}
