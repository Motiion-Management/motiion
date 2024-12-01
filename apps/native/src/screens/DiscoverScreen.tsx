import React from 'react';
import { View, Text, ScrollView, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';

const FeaturedCarousel = ({ title, profiles }) => (
  <View className="mb-6">
    <Text className="text-lg font-montserrat-bold mb-2">{title}</Text>
    <FlatList
      horizontal
      data={profiles}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <View className="mr-4">
          <Image
            source={{ uri: item.headshot }}
            className="w-24 h-24 rounded-full"
          />
          <Text className="text-center mt-2 font-inter-medium">{item.name}</Text>
        </View>
      )}
    />
  </View>
);

const DiscoverScreen = () => {
  const choreographers = useQuery(api.featuredMembers.getFeaturedChoreographers);
  const talent = useQuery(api.featuredMembers.getFeaturedTalent);
  const favorites = useQuery(api.users.getFavoriteUsersForCarousel);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 p-4">
        <Text className="text-2xl font-montserrat-bold mb-4">Discover</Text>
        <FeaturedCarousel title="Partnering Choreographers" profiles={choreographers} />
        <FeaturedCarousel title="Featured Talent" profiles={talent} />
        <FeaturedCarousel title="Favorite Profiles" profiles={favorites} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default DiscoverScreen;