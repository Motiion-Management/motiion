import { Authenticated, Unauthenticated, AuthLoading } from 'convex/react';
import { Stack, Redirect } from 'expo-router';
import React from 'react';
import { View, ActivityIndicator } from 'react-native';

export default function AppLayout() {
  console.log('📱 APP_LAYOUT: Using Convex auth components');

  return (
    <>
      <AuthLoading>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      </AuthLoading>
      
      <Unauthenticated>
        <Redirect href="/" />
      </Unauthenticated>
      
      <Authenticated>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade',
          }}
        />
      </Authenticated>
    </>
  );
}
