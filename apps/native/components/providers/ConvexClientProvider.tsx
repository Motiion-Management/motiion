'use client';

import { ClerkProvider, useAuth, ClerkLoaded } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { ConvexReactClient } from 'convex/react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
// import * as SecureStore from 'expo-secure-store';
import { ActivityIndicator, View } from 'react-native';

// const tokenCache = {
//   async getToken(key: string) {
//     try {
//       const item = await SecureStore.getItemAsync(key);
//       if (item) {
//         console.log(`${key} was used 🔐 \n`);
//       } else {
//         console.log('No values stored under key: ' + key);
//       }
//       return item;
//     } catch (error) {
//       console.error('SecureStore get item error: ', error);
//       await SecureStore.deleteItemAsync(key);
//       return null;
//     }
//   },
//   async saveToken(key: string, value: string) {
//     try {
//       await SecureStore.setItemAsync(key, value);
//     } catch (err) {
//       console.error('SecureStore save error:', err);
//     }
//   },
// };

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!);

function LoadingView() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}

export default function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider tokenCache={tokenCache}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
