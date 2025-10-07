import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { View } from 'react-native'
import { BlurView } from 'expo-blur'
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet'
import { Text } from '~/components/ui/text'
import { TabView, type TabRoute } from '~/components/ui/tabs/TabView'
import { TypecastDetails } from './TypecastDetails'
import { ProfileAboutTab } from './ProfileAboutTab'
import { ProfileResumeTab } from './ProfileResumeTab'
import { ProfileVisualsTab } from './ProfileVisualsTab'
import { type Doc } from '@packages/backend/convex/_generated/dataModel'

interface ProfileDetailsSheetProps {
  isOpen: boolean
  onClose: () => void
  dancer: Doc<'dancers'>
  recentProjects: Array<any>
  allProjects: Array<any>
  training: Array<any>
}

export function ProfileDetailsSheet({
  isOpen,
  onClose,
  dancer,
  recentProjects,
  allProjects,
  training
}: ProfileDetailsSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null)
  const snapPoints = useMemo(() => ['85%'], [])

  useEffect(() => {
    if (isOpen) {
      bottomSheetRef.current?.expand()
    } else {
      bottomSheetRef.current?.close()
    }
  }, [isOpen])

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose()
      }
    },
    [onClose]
  )

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5}>
        <BlurView intensity={20} style={{ flex: 1 }} tint="dark" />
      </BottomSheetBackdrop>
    ),
    []
  )

  const tabs: Array<TabRoute> = [
    { key: 'about', title: 'About' },
    { key: 'resume', title: 'Resume' },
    { key: 'visuals', title: 'Visuals' }
  ]

  const renderScene = (route: TabRoute) => {
    switch (route.key) {
      case 'about':
        return <ProfileAboutTab dancer={dancer} recentProjects={recentProjects} />
      case 'resume':
        return <ProfileResumeTab dancer={dancer} allProjects={allProjects} training={training} />
      case 'visuals':
        return <ProfileVisualsTab />
      default:
        return null
    }
  }

  const displayName = dancer.displayName || 'Dancer'

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: 'transparent' }}>
      <BottomSheetView className="flex-1 rounded-t-3xl bg-surface-default">
        {/* Header */}
        <View className="gap-2 px-4 pt-4">
          <Text variant="header3" className="font-semibold">
            {displayName}
          </Text>
          <Text variant="body" className="text-text-low">
            Dancer
          </Text>
          <TypecastDetails dancer={dancer} />
        </View>

        {/* Tabs */}
        <View className="mt-4 flex-1">
          <TabView routes={tabs} renderScene={renderScene} initialKey="about" />
        </View>
      </BottomSheetView>
    </BottomSheet>
  )
}
