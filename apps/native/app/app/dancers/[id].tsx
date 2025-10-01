import { api } from '@packages/backend/convex/_generated/api';
import { useQuery } from 'convex/react';
import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

export default function DancerScreen() {
  const { id } = useLocalSearchParams();
  // const dancer = useQuery(api.dancers.read(id))
  return <View></View>;
}
