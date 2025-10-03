import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '~/components/ui/text';
import Filter from '~/lib/icons/Filter';
import ChevronDown from '~/lib/icons/ChevronDown';

export type NotificationTab = 'general' | 'request';

export interface NotificationFiltersProps {
  activeTab: NotificationTab;
  onTabChange: (tab: NotificationTab) => void;
  generalCount: number;
  requestsCount: number;
}

export function NotificationFilters({
  activeTab,
  onTabChange,
  generalCount,
  requestsCount,
}: NotificationFiltersProps) {
  return (
    <View className="flex-row items-center gap-2 px-4 py-4">
      {/* Filter button */}
      <TouchableOpacity className="h-8 flex-row items-center gap-1 rounded-full bg-surface-tint px-4 py-1.5">
        <Filter className="h-4 w-4 text-white" />
        <ChevronDown className="h-4 w-4 text-white" />
      </TouchableOpacity>

      {/* General tab */}
      <TouchableOpacity
        onPress={() => onTabChange('general')}
        className={`h-8 flex-row items-center gap-2 rounded-full px-4 py-1.5 ${
          activeTab === 'general' ? 'bg-[rgba(0,122,110,0.7)]' : 'bg-surface-tint'
        }`}>
        {activeTab === 'general' && <View className="h-2 w-2 rounded-full bg-accent" />}
        <Text
          variant="bodySm"
          className={activeTab === 'general' ? 'text-white' : 'text-[#acacac]'}>
          General
        </Text>
        {generalCount > 0 && (
          <Text variant="header6" className="text-white">
            {generalCount}
          </Text>
        )}
      </TouchableOpacity>

      {/* Requests tab */}
      <TouchableOpacity
        onPress={() => onTabChange('request')}
        className={`h-8 flex-row items-center gap-2 rounded-full px-4 py-1.5 ${
          activeTab === 'request' ? 'bg-[rgba(0,122,110,0.7)]' : 'bg-surface-tint'
        }`}>
        {activeTab === 'request' && <View className="h-2 w-2 rounded-full bg-accent" />}
        <Text
          variant="bodySm"
          className={activeTab === 'request' ? 'text-white' : 'text-[#acacac]'}>
          Requests
        </Text>
        {requestsCount > 0 && (
          <Text variant="header6" className="text-white">
            {requestsCount}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
