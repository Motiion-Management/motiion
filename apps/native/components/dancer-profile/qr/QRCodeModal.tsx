import React from 'react'
import { View, Modal, Pressable, StatusBar } from 'react-native'
import { BlurView } from 'expo-blur'
import { SafeAreaView } from 'react-native-safe-area-context'
import { TabView, type TabRoute } from '~/components/ui/tabs/TabView'
import { Icon } from '~/lib/icons/Icon'
import { MyCodeTab } from './MyCodeTab'
import { ScanCodeTab } from './ScanCodeTab'

interface QRCodeModalProps {
  visible: boolean
  profileUrl: string
  onClose: () => void
}

export function QRCodeModal({ visible, profileUrl, onClose }: QRCodeModalProps) {
  const tabs: Array<TabRoute> = [
    { key: 'scan', title: 'Scan Code' },
    { key: 'mycode', title: 'My Code' },
  ]

  const handleScanSuccess = () => {
    // Close modal after successful scan
    onClose()
  }

  const renderScene = (route: TabRoute) => {
    switch (route.key) {
      case 'scan':
        return <ScanCodeTab onScanSuccess={handleScanSuccess} />
      case 'mycode':
        return <MyCodeTab profileUrl={profileUrl} />
      default:
        return null
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent>
      <StatusBar barStyle="light-content" />
      {/* Full screen blurred overlay */}
      <View className="absolute inset-0 bg-black/80">
        <BlurView intensity={20} tint="dark" style={{ flex: 1 }}>
          {/* Close button overlay - top left */}
          <SafeAreaView edges={['top']} className="absolute left-0 right-0 top-0 z-50">
            <View className="px-4 py-2">
              <Pressable
                onPress={onClose}
                className="h-10 w-10 items-center justify-center rounded-full active:opacity-70">
                <Icon name="xmark" size={24} className="text-white" />
              </Pressable>
            </View>
          </SafeAreaView>

          {/* Centered modal content */}
          <View className="flex-1 items-center justify-center px-4">
            <View className="w-full max-w-[370px] overflow-hidden rounded-[18px] border-[0.5px] border-white/10 bg-surface-tint/80 backdrop-blur-xl">
              <View className="h-[600px]">
                <TabView
                  routes={tabs}
                  renderScene={renderScene}
                  initialKey="mycode"
                  tabStyle="pill"
                  tabContainerClassName="px-4 pt-5 pb-4"
                  contentClassName="flex-1"
                />
              </View>
            </View>
          </View>

          {/* Bottom safe area */}
          <SafeAreaView edges={['bottom']} />
        </BlurView>
      </View>
    </Modal>
  )
}
