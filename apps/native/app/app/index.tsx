import { Redirect } from 'expo-router';
import React from 'react';

/**
 * Default route for /app
 * The layout (app/_layout.tsx) handles onboarding redirect logic
 * This just sends users to the main tab navigator
 */
export default function AppIndex() {
  return <Redirect href="/app/home" />;
}
