import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';

import { BackgroundGradientView } from '~/components/ui/background-gradient-view';
import { Text } from '~/components/ui/text';

interface AuthErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface AuthErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  isAuthError: boolean;
}

export class AuthErrorBoundary extends React.Component<
  AuthErrorBoundaryProps,
  AuthErrorBoundaryState
> {
  constructor(props: AuthErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, isAuthError: false };
  }

  static getDerivedStateFromError(error: Error): AuthErrorBoundaryState {
    // Check if this is an authentication-related error
    const isAuthError =
      error.message.includes('must be logged in') ||
      error.message.includes('user not found') ||
      error.message.includes('User not found in database') ||
      error.message.includes('Authentication') ||
      error.message.includes('Unauthorized') ||
      error.message.includes('Maximum update depth exceeded'); // Catch infinite render loops

    return {
      hasError: true,
      error,
      isAuthError,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('AuthErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // If it's an authentication error, redirect to login
      if (this.state.isAuthError) {
        return <Redirect href="/" />;
      }

      // For non-auth errors, show fallback or generic error UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <BackgroundGradientView>
          <View className="flex-1 items-center justify-center px-6">
            <Text variant="heading" className="mb-4 text-center">
              Something went wrong
            </Text>
            <Text variant="body" className="text-text-muted mb-6 text-center">
              We're having trouble loading this page. Please try again.
            </Text>
            <ActivityIndicator size="large" />
          </View>
        </BackgroundGradientView>
      );
    }

    return this.props.children;
  }
}
