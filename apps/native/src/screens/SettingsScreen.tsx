import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SettingsOption = ({ title, onPress }) => (
  <TouchableOpacity onPress={onPress} className="py-4 border-b border-gray-200">
    <Text className="font-inter-medium">{title}</Text>
  </TouchableOpacity>
);

const SettingsScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 p-4">
        <Text className="text-2xl font-montserrat-bold mb-4">Settings</Text>
        <View className="bg-white rounded-lg p-4">
          <SettingsOption title="Account" onPress={() => { }} />
          <SettingsOption title="Notifications" onPress={() => { }} />
          <SettingsOption title="Privacy" onPress={() => { }} />
          <SettingsOption title="Help & Support" onPress={() => { }} />
          <SettingsOption title="About" onPress={() => { }} />
          <SettingsOption title="Log Out" onPress={() => { }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;
