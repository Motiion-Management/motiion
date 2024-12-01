import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';

const TalentHomeScreen = () => {
  const user = useQuery(api.users.getMyUser);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 p-4">
        <Text className="text-2xl font-montserrat-bold mb-4">Welcome, {user?.name}</Text>
        <View className="bg-white rounded-lg p-4 mb-4">
          <Text className="text-lg font-inter-semibold mb-2">Your Profile</Text>
          <Text className="font-inter-regular">Complete your profile to increase visibility</Text>
        </View>
        <View className="bg-white rounded-lg p-4 mb-4">
          <Text className="text-lg font-inter-semibold mb-2">Upcoming Auditions</Text>
          <Text className="font-inter-regular">No upcoming auditions</Text>
        </View>
        <View className="bg-white rounded-lg p-4">
          <Text className="text-lg font-inter-semibold mb-2">Recent Activity</Text>
          <Text className="font-inter-regular">No recent activity</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TalentHomeScreen;