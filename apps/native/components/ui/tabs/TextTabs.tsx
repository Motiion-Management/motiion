import React from 'react'
import { View, Pressable } from 'react-native'
import { Text } from '~/components/ui/text'

type TextTabsProps = {
  tabs: string[]
  activeIndex: number
  onTabPress: (index: number) => void
}

export function TextTabs({ tabs, activeIndex, onTabPress }: TextTabsProps) {
  return (
    <View className="flex-row gap-4">
      {tabs.map((tab, index) => {
        const isActive = index === activeIndex
        return (
          <Pressable
            key={tab}
            onPress={() => onTabPress(index)}
            className={`pb-4 ${
              isActive ? 'border-b-[1.5px] border-border-high' : ''
            }`}>
            <Text
              variant="header5"
              className={`font-semibold ${
                isActive ? 'text-text-default' : 'text-text-disabled'
              }`}>
              {tab}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}
