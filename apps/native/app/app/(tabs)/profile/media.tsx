import React from 'react';
import { View, ScrollView } from 'react-native';

import { Text } from '~/components/ui/text';
import { TabScreenLayout } from '~/components/layouts/TabScreenLayout';
import { TabbedView } from '~/components/ui/tabs/TabbedView';
import { MultiImageUpload } from '~/components/upload';

export default function MediaScreen() {
  const tabs = ['Headshots', 'Reels'];

  return (
    <TabScreenLayout
      header={{
        left: 'back',
        middle: 'Media',
      }}>
      <View className="flex-1 px-4">
        <TabbedView tabs={tabs} className="flex-1" contentClassName="flex-1 pt-6">
          {(activeTab) => (
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              {activeTab === 'Headshots' && <MultiImageUpload />}
              {activeTab === 'Reels' && (
                <View className="flex-1 items-center justify-center p-8">
                  <Text variant="body" className="text-center text-text-low">
                    Coming soon
                  </Text>
                </View>
              )}
            </ScrollView>
          )}
        </TabbedView>
      </View>
    </TabScreenLayout>
  );
}
