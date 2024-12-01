import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';

const ProfileScreen = () => {
  const user = useQuery(api.users.getMyUser);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 p-4">
        <Text className="text-2xl font-montserrat-bold mb-4">Your Profile</Text>
        <View className="bg-white rounded-lg p-4 mb-4">
          <Text className="text-lg font-inter-semibold mb-2">Headshots</Text>
          <TouchableOpacity className="bg-primary py-2 px-4 rounded">
            <Text className="text-white font-inter-medium">Manage Headshots</Text>
          </TouchableOpacity>
        </View>
        <View className="bg-white rounded-lg p-4 mb-4">
          <Text className="text-lg font-inter-semibold mb-2">Resume</Text>
          <TouchableOpacity className="bg-primary py-2 px-4 rounded">
            <Text className="text-white font-inter-medium">Edit Resume</Text>
          </TouchableOpacity>
        </View>
        <View className="bg-white rounded-lg p-4 mb-4">
          <Text className="text-lg font-inter-semibold mb-2">About</Text>
          <Text className="font-inter-regular mb-2">{user?.about || 'Add your bio'}</Text>
          <TouchableOpacity className="bg-primary py-2 px-4 rounded">
            <Text className="text-white font-inter-medium">Edit About</Text>
          </TouchableOpacity>
        </View>
        <View className="bg-white rounded-lg p-4">
          <Text className="text-lg font-inter-semibold mb-2">Links</Text>
          <TouchableOpacity className="bg-primary py-2 px-4 rounded">
            <Text className="text-white font-inter-medium">Manage Links</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;