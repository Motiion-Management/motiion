import { useRouter } from 'expo-router'
import { useQuery } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'

import { TabScreenLayout } from '~/components/layouts/TabScreenLayout'
import { Text } from '~/components/ui/text'
import { HighlightGrid } from '~/components/highlights/HighlightGrid'
import { View } from 'react-native'

export default function HighlightsScreen() {
  const router = useRouter()
  const highlights = useQuery(api.highlights.getMyHighlights)

  const handleAddPress = () => {
    router.push('/app/(modals)/add-highlight')
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
    </TabScreenLayout>
  )
}
