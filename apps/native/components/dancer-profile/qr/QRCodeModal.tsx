import React from 'react'
import { View } from 'react-native'
import { Sheet } from '~/components/ui/sheet/sheet'
import { TabView, type TabRoute } from '~/components/ui/tabs/TabView'
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
    <Sheet
      isOpened={visible}
      onIsOpenedChange={(isOpen) => {
        if (!isOpen) {
          onClose()
        }
      }}
      backgroundClassName="bg-surface-tint backdrop-blur-md"
      enableCustomHandle={false}
      snapPoints={['90%']}
      enableDynamicSizing={false}>
      <View className="h-[600px]">
        <TabView
          routes={tabs}
          renderScene={renderScene}
          initialKey="mycode"
          tabStyle="pill"
          tabContainerClassName="px-4 pb-4"
          contentClassName="flex-1"
        />
      </View>
    </Sheet>
  )
}
